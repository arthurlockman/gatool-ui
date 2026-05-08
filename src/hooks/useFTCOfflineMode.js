import { useState, useEffect } from "react";
import { usePersistentState } from "./UsePersistentState";
import { useEventSelection } from "../contexts/EventSelectionContext";

const ftcBaseURL = "https://api.gatool.org/ftc/v2/";

export function useFTCOfflineMode({ httpClient, isOnline }) {
  const { ftcMode, selectedYear } = useEventSelection();
  const [FTCOfflineAvailable, setFTCOfflineAvailable] = useState(false);
  const [useFTCOffline, setUseFTCOffline] = usePersistentState(
    "setting:useFTCOffline",
    false
  );
  const [FTCKey, setFTCKey] = usePersistentState("setting:FTCKey", {});
  const [FTCServerURL, setFTCServerURL] = usePersistentState(
    "setting:FTCServerURL",
    "http://10.0.100.5"
  );
  const [manualOfflineMode, setManualOfflineMode] = usePersistentState(
    "setting:manualOfflineMode",
    false
  );
  const [ftcLeagues, setFTCLeagues] = usePersistentState(
    "cache:ftcLeagues",
    []
  );
  const [ftcTypes, setFTCTypes] = usePersistentState("cache:ftcTypes", []);

  // eslint-disable-next-line
  const getFTCOfflineStatus = async () => {
    // See if you can connect to FTC Local Server
    // Requires that FTC Server URL be set.
    console.log("Checking FTC Local Server status...");
    try {
      const result = await httpClient.getNoAuth(
        `/api/v1/version/`,
        FTCServerURL,
        5000,
        { Authorization: FTCKey?.key || "" }
      );
      if (result?.status === 200) {
        console.log("FTC Local Server is available.");
        return setFTCOfflineAvailable(true);
      } else {
        console.log("FTC Local Server is not available.");
        return setFTCOfflineAvailable(false);
      }
    } catch (error) {
      console.log("Error fetching FTC Local Server status:", error.message);
      return setFTCOfflineAvailable(false);
    }
  };

  // Check the status of FTC Local Server when the URL changes
  useEffect(() => {
    if (ftcMode?.value === "FTCLocal" && FTCServerURL) {
      getFTCOfflineStatus();
    }
  }, [FTCServerURL, ftcMode?.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const getFTCLeagues = async () => {
    // Skip external API calls when in FTC offline mode without internet
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log("FTC Offline mode: Skipping FTC Leagues API call while offline" + (manualOfflineMode ? " (manual override)" : "") + " - using cached leagues");
      return;
    }

    try {
      const val = await httpClient.getNoAuth(
        `${selectedYear?.value}/leagues`,
        ftcMode ? ftcBaseURL : undefined
      );
      if (val.status === 200) {
        // @ts-ignore
        const json = await val.json();
        if (typeof json.Leagues !== "undefined") {
          json.leagues = json.Leagues;
          delete json.Leagues;
        }
        const leagues = json.leagues.map((league) => {
          return { label: league.name, value: league.code };
        });

        setFTCLeagues(leagues);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Request FTC Key from local FTC Server
  const requestFTCKey = async () => {
    const val = await httpClient.postNoAuth(
      `/api/v1/keyrequest/?name=gatool`,
      null,
      FTCServerURL,
      null
    );
    if (val.status === 200) {
      // @ts-ignore
      const json = await val.json();
      setFTCKey({ ...json, FTCServerURL: FTCServerURL, active: false });
    }
  };

  // Get the FTC Key from gatool Cloud
  const checkFTCKey = async () => {
    const val = await httpClient.getNoAuth(
      `/api/v1/keycheck/`,
      FTCServerURL,
      undefined,
      { Authorization: FTCKey?.key || "" }
    );
    if (val.status === 200) {
      // @ts-ignore
      const json = await val.json();
      setFTCKey({ ...FTCKey, active: json?.active });
    }
  };

  // Reset manual offline mode when switching to FRC or FTC Online mode
  useEffect(() => {
    if (ftcMode?.value !== "FTCLocal" && manualOfflineMode) {
      console.log("Switching to online mode, resetting manual offline mode");
      setManualOfflineMode(false);
    }
  }, [ftcMode, manualOfflineMode, setManualOfflineMode]);

  return {
    FTCOfflineAvailable,
    useFTCOffline, setUseFTCOffline,
    FTCKey, setFTCKey,
    FTCServerURL, setFTCServerURL,
    manualOfflineMode, setManualOfflineMode,
    ftcLeagues, setFTCLeagues,
    ftcTypes, setFTCTypes,
    getFTCOfflineStatus,
    getFTCLeagues,
    requestFTCKey,
    checkFTCKey,
  };
}
