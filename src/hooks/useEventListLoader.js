import _ from "lodash";
import moment from "moment";
import { timeZones } from "../data/timeZones";

const paleYellow = "#fdfaed";
const paleBlue = "#effdff";
const ftcBaseURL = "https://api.gatool.org/ftc/v2/";

const timezones = _.cloneDeep(timeZones);

/**
 * Hook that manages event list fetching, TBA offseason event merging,
 * and district retrieval.
 *
 * Extracted from App.jsx Phase 6e Step 3.
 *
 * @param {Object} deps - Dependencies from App.jsx
 * @returns {{ getEvents: Function, getDistricts: Function }}
 */
export function useEventListLoader(deps) {
  const {
    httpClient,
    selectedYear,
    ftcMode,
    useFTCOffline,
    FTCServerURL,
    FTCKey,
    isOnline,
    training,
    supportedYears,
    selectedEvent,
    eventsLoading,
    eventnames,
    regionLookup,
    // Setters
    setEvents,
    setEventsLoading,
    setFTCTypes,
    setEventNamesCY,
    setDistricts,
    setSelectedEvent,
    // Callback for module-level ftcregions mutation (pre-existing pattern)
    updateFtcRegions,
  } = deps;

  /**
   * Fetch all TBA offseason events for a given year
   * @param {string} year
   * @returns {Promise<Array>}
   */
  const fetchTBAEvents = async (year) => {
    try {
      console.log(`Fetching all TBA offseason events for ${year}...`);
      const result = await httpClient.getNoAuth(`${year}/offseason/events/`);
      if (result.status === 200) {
        // @ts-ignore
        const tbaEvents = await result.json();
        return tbaEvents.events || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching TBA events:", error);
      return [];
    }
  };

  /**
   * Merge TBA offseason events with FIRST events, matching by event code or name.
   * Unmatched TBA events are added as new OffSeason entries.
   */
  const mergeTBAWithFIRSTEvents = (firstEvents, tbaEvents, year) => {
    console.log(`Merging ${tbaEvents.length} TBA events with ${firstEvents.length} FIRST events...`);

    // Clone FIRST events to avoid mutations
    let mergedEvents = _.cloneDeep(firstEvents);
    const unmatchedTBAEvents = [];

    // Process each TBA event
    tbaEvents.forEach((tbaEvent) => {
      let matched = false;

      // First, try to match by firstEventCode
      const firstCodeMatch = _.findIndex(mergedEvents, (e) =>
        e.code?.toLowerCase() === tbaEvent.firstEventCode?.toLowerCase()
      );

      if (firstCodeMatch >= 0) {
        // Found a match by event code - add TBA event key
        mergedEvents[firstCodeMatch].tbaEventKey = tbaEvent.code?.split(year)[1];
        matched = true;
      } else {
        // Try to match by name
        const nameMatch = _.findIndex(mergedEvents, (e) =>
          e.name?.trim() === tbaEvent.name?.trim()
        );

        if (nameMatch >= 0) {
          // Found a match by name - add TBA event key
          mergedEvents[nameMatch].tbaEventKey = tbaEvent.code?.split(year)[1];
          matched = true;
        }
      }

      // If no match found, add as a new offseason event
      if (!matched) {
        unmatchedTBAEvents.push(tbaEvent);
      }
    });

    // Add unmatched TBA events as new OffSeason events
    unmatchedTBAEvents.forEach((tbaEvent) => {
      // Create a FIRST-compatible event object from TBA event
      const newEvent = {
        eventId: null,
        code: tbaEvent.code,
        divisionCode: null,
        name: tbaEvent.name,
        remote: false,
        hybrid: false,
        fieldCount: null,
        published: false,
        type: "OffSeason",
        typeName: "Offseason Event",
        regionCode: null,
        leagueCode: null,
        districtCode: null,
        venue: tbaEvent.venue || tbaEvent.location_name || null,
        address: tbaEvent.address || null,
        city: tbaEvent.city || null,
        stateprov: tbaEvent.stateprov || tbaEvent.state_prov || null,
        country: tbaEvent.country || null,
        website: tbaEvent.website || null,
        liveStreamUrl: null,
        coordinates: null,
        webcasts: tbaEvent.webcasts || null,
        timezone: tbaEvent.timezone || null,
        dateStart: tbaEvent.dateStart || tbaEvent.start_date ? moment(tbaEvent.dateStart || tbaEvent.start_date).format() : null,
        dateEnd: tbaEvent.dateEnd || tbaEvent.end_date ? moment(tbaEvent.dateEnd || tbaEvent.end_date).format() : null,
        tbaEventKey: tbaEvent.code?.split(year)[1],
        weekNumber: null,
        champLevel: "",
      };

      mergedEvents.push(newEvent);
    });

    console.log(`Merge complete. Total events: ${mergedEvents.length} (${unmatchedTBAEvents.length} new from TBA)`);
    return mergedEvents;
  };

  /**
   * Fetch events list for the current year/program mode.
   * Handles FRC, FTC, and FTC Offline modes.
   * Merges TBA offseason events for FRC mode.
   * CRITICAL: Refreshes selectedEvent with enriched API data
   * (tbaEventKey, leagueCode, districtCode) that loadEvent depends on.
   */
  const getEvents = async () => {
    if (
      eventsLoading === "" ||
      eventsLoading !==
      `${ftcMode ? ftcMode.value : "FRC"}-${selectedYear?.value}`
    ) {
      console.log(
        `Loading ${ftcMode ? ftcMode.label : "FRC"} events list for for ${selectedYear?.value
        }...`
      );
      setEventsLoading(
        `${ftcMode ? ftcMode.label : "FRC"}-${selectedYear?.value}`
      );
      try {
        let result;
        if (useFTCOffline) {
          const val = await httpClient.getNoAuth(
            `/api/v1/events/`,
            FTCServerURL
          );
          if (val.status === 200) {
            // @ts-ignore
            result = await val.json();
          }
          if (result?.eventCodes?.length > 0) {
            let events = result.eventCodes.map(async (code) => {
              const val = await httpClient.getNoAuth(
                `/api/v1/events/${code}/`,
                FTCServerURL,
                undefined,
                { Authorization: FTCKey?.key || "" }
              );
              if (val.status === 200) {
                // @ts-ignore
                const localEvent = await val.json();
                return {
                  eventId: localEvent.eventCode,
                  code: localEvent.eventCode,
                  divisionCode: null,
                  name: localEvent.name,
                  remote: false,
                  hybrid: false,
                  fieldCount: localEvent.fieldCount,
                  published: false,
                  type: localEvent.type,
                  typeName: "Local Event",
                  regionCode: null,
                  leagueCode: null,
                  districtCode: null,
                  venue: null,
                  address: null,
                  city: null,
                  stateprov: null,
                  country: null,
                  website: null,
                  liveStreamUrl: null,
                  coordinates: null,
                  webcasts: null,
                  timezone: null,
                  dateStart: moment(localEvent.start).format(),
                  dateEnd: moment(localEvent.end).format(),
                };
              }
            });
            await Promise.all(events).then((values) => {
              result.events = values;
            });
          } else {
            result = { events: [] };
          }
        } else {
          const val = await httpClient.getNoAuth(
            `${selectedYear?.value}/events`,
            ftcMode ? ftcBaseURL : null
          );
          if (val.status === 200) {
            // @ts-ignore
            result = await val.json();
          }
        }

        if (typeof result.Events !== "undefined") {
          result.events = result.Events;
          delete result.Events;
        }
        var timeNow = moment();

        // Add training events for current season only
        if (selectedYear?.value === supportedYears[0].value && !ftcMode) {
          result.events = result?.events.concat(training.events.events);
        } else if (!ftcMode) {
          // Add OFFLINE event for all FRC seasons
          const offlineEvent = training.events.events.find(e => e.code === "OFFLINE");
          if (offlineEvent) {
            result.events = result?.events.concat([offlineEvent]);
          }
        }

        // Fetch and merge TBA offseason events for FRC mode
        if (!ftcMode && isOnline) {
          try {
            const tbaEvents = await fetchTBAEvents(selectedYear?.value);
            if (tbaEvents.length > 0) {
              result.events = mergeTBAWithFIRSTEvents(result.events, tbaEvents, selectedYear?.value);
            }
          } catch (error) {
            console.error("Error fetching/merging TBA events:", error);
            // Continue with FIRST events only if TBA fetch fails
          }
        }

        // FTC: kickoff events are not competition events; omit from picker and type filters
        if (ftcMode) {
          result.events = _.filter(result?.events, (e) => {
            const type = String(
              _.get(e, "type") ?? _.get(e, "Type") ?? ""
            )
              .trim()
              .toUpperCase();
            const typeName = String(
              _.get(e, "typeName") ?? _.get(e, "TypeName") ?? ""
            )
              .trim()
              .toUpperCase();
            return type !== "12" && typeName !== "KICKOFF";
          });
        }

        var regionCodes = [];
        var types = [];
        const events = result?.events.map((e) => {
          var color = "";
          /** @type {null | 'offseasonAzure' | 'offseason'} */
          var eventMenuTint = null;
          var optionPrefix = "";
          var optionPostfix = "";
          var filters = [];

          // We have four formats available in timezones: abbreviation, description, Livemeeting and Windows. We lookup the Windows
          // format and convert it to a more standard format. Consider moving off of Moment on to Luxor?

          e.timeZoneAbbreviation =
            timezones[
              _.findIndex(timezones, { Windows: e.timezone })
            ]?.Abbreviation;

          var eventTime = e.dateEnd ? moment(e.dateEnd) : moment();
          e.name = e.name.trim();
          e.name = _.replace(e.name, `- FIRST Robotics Competition -`, `-`);
          e.name = _.replace(
            e.name,
            `FIRST Championship - FIRST Robotics Competition`,
            `FIRST Championship - Einstein`
          );
          if (e.code === "week0" || e.code === "WEEK0") {
            filters.push("week0");
          }
          if (e.type === "OffSeasonWithAzureSync") {
            color = paleBlue;
            eventMenuTint = "offseasonAzure";
            optionPrefix = "•• ";
            optionPostfix = " ••";
            filters.push("offseason");
          }
          if (e.type === "OffSeason" || e.type === "10") {
            color = paleYellow;
            eventMenuTint = "offseason";
            optionPrefix = "•• ";
            optionPostfix = " ••";
            filters.push("offseason");
          }
          if (e.type === "Regional") {
            filters.push("regional");
          } else if (e.type.startsWith("Champion")) {
            filters.push("champs");
          } else if (e.districtCode) {
            filters.push("district");
            filters.push(e.districtCode);
          } else if (ftcMode) {
            filters.push(e.type);
            filters.push(e.leagueCode);
            filters.push(e.regionCode);
            regionCodes.push({
              regionCode: e.regionCode,
              description: regionLookup[e.regionCode]
                ? `${regionLookup[e.regionCode]} (${e.regionCode})`
                : e.regionCode,
            });
            types.push({ type: e.type, description: e.typeName });
          }

          if (timeNow.diff(eventTime) < 0) {
            filters.push("future");
          } else {
            filters.push("past");
          }
          if (
            eventTime.diff(timeNow, "days") <= 7 &&
            eventTime.diff(timeNow, "days") >= -0
          ) {
            filters.push("thisWeek");
          }
          if (
            eventTime.diff(timeNow, "weeks") <= 4 &&
            eventTime.diff(timeNow, "weeks") >= 0
          ) {
            filters.push("thisMonth");
          }
          if (e.type !== "OffSeason" && e.type !== "OffSeasonWithAzureSync") {
            filters.push("week" + e.weekNumber);
          }

          e.champLevel = "";

          // new method using event type data
          if (
            e.type === "DistrictChampionship" ||
            e.type === "DistrictChampionshipWithLevels"
          ) {
            e.champLevel = "DISTCHAMPS";
          } else if (e.type === "DistrictChampionshipDivision") {
            e.champLevel = "DISTDIV";
          } else if (e.type === "ChampionshipDivision") {
            e.champLevel = "CMPDIV";
          } else if (e.type === "ChampionshipSubdivision") {
            e.champLevel = "CMPSUB";
          } else if (e.type === "Championship") {
            e.champLevel = "CHAMPS";
          } else if (e.type === "6") {
            e.champLevel = "CHAMPS";
          }

          return {
            value: e,
            label: `${optionPrefix}${e.name}${optionPostfix}`,
            color: color,
            eventMenuTint: eventMenuTint,
            filters: filters,
          };
        });

        // use for diagnostics to find missing regionCodes
        // regionCodes = _.filter(_.uniqBy(regionCodes,"regionCode"),function(o) {return _.filter(ftcregions, {regionCode:o.regionCode}).length === 0;});

        // Update module-level ftcregions via callback (pre-existing mutation pattern)
        updateFtcRegions(
          _.orderBy(
            _.uniqBy(regionCodes, "regionCode"),
            "description",
            "asc"
          )
        );

        types = _.orderBy(_.uniqBy(types, "type"), "description", "asc");
        setFTCTypes(types);

        //Ensure that current year event names change when Division or sponsor names change
        if (typeof eventnames[selectedYear?.value] === "undefined") {
          eventnames[selectedYear?.value] = {};
        }

        events.forEach((event) => {
          eventnames[selectedYear?.value][event?.value?.code] =
            event?.value?.name;
        });
        setEventNamesCY(eventnames[selectedYear?.value]);

        setEvents(events);
        // Check if the currently selected event still exists in the newly loaded events list
        if (selectedEvent) {
          const matchingEvent = _.find(events, (event) => event?.value?.code === selectedEvent?.value?.code);
          if (matchingEvent) {
            // Update the selected event with fresh data from the API
            console.log("Updating selected event with fresh data from API");
            setSelectedEvent(matchingEvent);
          } else {
            // Event no longer exists in the list, clear selection
            console.log("Previously selected event not found in current events list, clearing selection");
            setSelectedEvent(null);
            setEventsLoading("");
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log(
        `Events already loaded for ${ftcMode ? ftcMode.label : "FRC"}-${selectedYear?.value
        }. Skipping...`
      );
    }
  };

  /**
   * Fetch district list for the current year (FRC mode only).
   */
  const getDistricts = async () => {
    try {
      const val = await httpClient.getNoAuth(
        `${selectedYear?.value}/districts`
      );
      if (val.status === 200) {
        // @ts-ignore
        const json = await val.json();
        if (typeof json.Districts !== "undefined") {
          json.districts = json.Districts;
          delete json.Districts;
        }
        const districts = json.districts.map((district) => {
          return { label: district.name, value: district.code };
        });

        setDistricts(districts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { getEvents, getDistricts };
}
