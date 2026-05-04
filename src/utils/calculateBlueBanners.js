/**
 * Calculates blue banner counts from championship appearances and TBA awards.
 * Pure function — no React dependencies, no side effects.
 *
 * @param {object} champsAppearances - Object with an `events` array of TBA event objects
 * @param {Array} awards - Array of TBA award objects
 * @returns {object} Banner counts and years by category
 */
export default function calculateBlueBanners(champsAppearances, awards) {
  const banners = {
    blueBanners: 0,
    blueBannersYears: [],

    // Regional Level
    regionalWins: 0,
    regionalWinsYears: [],
    regionalChairmans: 0,
    regionalChairmansYears: [],
    regionalImpact: 0,
    regionalImpactYears: [],
    regionalWoodieFlowers: 0,
    regionalWoodieFlowersYears: [],

    // District Level
    districtWins: 0,
    districtWinsYears: [],
    districtChairmans: 0,
    districtChairmansYears: [],
    districtImpact: 0,
    districtImpactYears: [],
    districtWoodieFlowers: 0,
    districtWoodieFlowersYears: [],

    // District Championship Division Level
    districtDivisionWins: 0,
    districtDivisionWinsYears: [],
    districtDivisionChairmans: 0,
    districtDivisionChairmansYears: [],
    districtDivisionImpact: 0,
    districtDivisionImpactYears: [],

    // District Championship Level
    districtChampionshipWins: 0,
    districtChampionshipWinsYears: [],
    districtChampionshipChairmans: 0,
    districtChampionshipChairmansYears: [],
    districtChampionshipImpact: 0,
    districtChampionshipImpactYears: [],
    districtChampionshipWoodieFlowers: 0,
    districtChampionshipWoodieFlowersYears: [],

    // World Championship Division Level
    championshipDivisionWins: 0,
    championshipDivisionWinsYears: [],
    championshipDivisionChairmans: 0,
    championshipDivisionChairmansYears: [],
    championshipDivisionImpact: 0,
    championshipDivisionImpactYears: [],

    // World Championship (Einstein) Level
    einsteinWins: 0,
    einsteinWinsYears: [],
    einsteinChairmans: 0,
    einsteinChairmansYears: [],
    einsteinImpact: 0,
    einsteinImpactYears: [],
    einsteinChairmansFinalist: 0,
    einsteinChairmansFinalistYears: [],
    einsteinImpactFinalist: 0,
    einsteinImpactFinalistYears: [],
    championshipWoodieFlowers: 0,
    championshipWoodieFlowersYears: [],

    // Festival of Champions
    festivalWins: 0,
    festivalWinsYears: [],
  };

  // Create a map of event keys to event objects for quick lookup
  const eventMap = {};
  if (champsAppearances?.events) {
    champsAppearances.events.forEach((event) => {
      eventMap[event.key] = event;
    });
  }

  // Process each award
  if (!awards || !Array.isArray(awards)) {
    return banners;
  }

  awards.forEach((award) => {
    const event = eventMap[award.event_key];
    if (!event) return;

    const isWin = award.award_type === 1;
    const isChairmans = award.award_type === 0 && (
      award.name.includes("Chairman") ||
      award.name.toLowerCase().includes("chairman")
    );
    const isImpact = award.award_type === 0 && award.name.includes("Impact");
    const isChairmansImpactFinalist = award.award_type === 69 && (
      award.name.includes("Chairman") ||
      award.name.toLowerCase().includes("chairman") ||
      award.name.includes("Impact")
    );
    const isWoodieFlowers = award.award_type === 3 && (
      award.name.includes("Woodie Flowers") ||
      award.name.toLowerCase().includes("woodie flowers")
    );

    // Only count Blue Banner awards
    if (!isWin && !isChairmans && !isImpact && !isChairmansImpactFinalist && !isWoodieFlowers) return;

    // Determine event level and category
    const eventType = event.event_type;
    const eventTypeString = event.event_type_string;
    const eventName = event.name || "";
    const eventKey = event.key || "";

    // Check for Festival of Champions
    const isFestival = eventName.toLowerCase().includes("festival of champions") ||
      eventKey.toLowerCase().includes("festival");

    // Event type codes:
    // 0 = Regional
    // 1 = District
    // 2 = District Championship
    // 3 = Championship Division
    // 4 = Championship Finals (Einstein)
    // 5 = District Championship Division
    // 99 = Offseason

    if (isFestival && isWin) {
      banners.festivalWins += 1;
      banners.festivalWinsYears.push(award.year);
      banners.blueBanners += 1;
      banners.blueBannersYears.push(award.year);
    } else if (eventType === 0) {
      // Regional
      if (isWin) {
        banners.regionalWins += 1;
        banners.regionalWinsYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isChairmans) {
        banners.regionalChairmans += 1;
        banners.regionalChairmansYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isImpact) {
        banners.regionalImpact += 1;
        banners.regionalImpactYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isWoodieFlowers) {
        banners.regionalWoodieFlowers += 1;
        banners.regionalWoodieFlowersYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      }
    } else if (eventType === 1) {
      // District
      if (isWin) {
        banners.districtWins += 1;
        banners.districtWinsYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isChairmans) {
        banners.districtChairmans += 1;
        banners.districtChairmansYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isImpact) {
        banners.districtImpact += 1;
        banners.districtImpactYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isWoodieFlowers) {
        banners.districtWoodieFlowers += 1;
        banners.districtWoodieFlowersYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      }
    } else if (eventType === 2) {
      // District Championship or District Championship with Divisions
      // Check if it's a division within a district championship
      const isDivision = event.parent_event_key !== null ||
        eventTypeString === "District Championship Division" ||
        eventName.toLowerCase().includes("division");

      if (isDivision) {
        // District Championship Division
        if (isWin) {
          banners.districtDivisionWins += 1;
          banners.districtDivisionWinsYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isChairmans) {
          banners.districtDivisionChairmans += 1;
          banners.districtDivisionChairmansYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isImpact) {
          banners.districtDivisionImpact += 1;
          banners.districtDivisionImpactYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        }
      } else {
        // District Championship (Einstein-equivalent)
        if (isWin) {
          banners.districtChampionshipWins += 1;
          banners.districtChampionshipWinsYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isChairmans) {
          // District Championship Chairman's awards are counted as Regional awards
          banners.regionalChairmans += 1;
          banners.regionalChairmansYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isImpact) {
          // District Championship Impact awards are counted as Regional awards
          banners.regionalImpact += 1;
          banners.regionalImpactYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isWoodieFlowers) {
          banners.districtChampionshipWoodieFlowers += 1;
          banners.districtChampionshipWoodieFlowersYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        }
      }
    } else if (eventType === 3 || eventType === 5) {
      // Championship Division (at World Championships)
      if (isWin) {
        banners.championshipDivisionWins += 1;
        banners.championshipDivisionWinsYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isChairmans) {
        banners.championshipDivisionChairmans += 1;
        banners.championshipDivisionChairmansYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isImpact) {
        banners.championshipDivisionImpact += 1;
        banners.championshipDivisionImpactYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      }
    } else if (eventType === 4) {
      // Championship Finals (Einstein)
      if (isWin) {
        banners.einsteinWins += 1;
        banners.einsteinWinsYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isChairmans) {
        banners.einsteinChairmans += 1;
        banners.einsteinChairmansYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isImpact) {
        banners.einsteinImpact += 1;
        banners.einsteinImpactYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isChairmansImpactFinalist) {
        // Chairman's/Impact Finalist - determine which type based on award name
        if (award.name.includes("Chairman") || award.name.toLowerCase().includes("chairman")) {
          banners.einsteinChairmansFinalist += 1;
          banners.einsteinChairmansFinalistYears.push(award.year);
        } else {
          banners.einsteinImpactFinalist += 1;
          banners.einsteinImpactFinalistYears.push(award.year);
        }
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (isWoodieFlowers) {
        banners.championshipWoodieFlowers += 1;
        banners.championshipWoodieFlowersYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      }
    }
  });

  return banners;
}
