import { useState } from "react";
import { usePersistentState } from "./UsePersistentState";
import { fetchLocal } from "../utils/fetchLocal";

export function useCheesyArenaStatus() {
  const [cheesyArenaAvailable, setCheesyArenaAvailable] = useState(false);
  const [useCheesyArena, setUseCheesyArena] = usePersistentState(
    "setting:useCheesyArena",
    null
  );
  const [cheesyTeamList, setCheesyTeamList] = useState([]);

  const getCheesyStatus = async () => {
    console.log("Checking Cheesy Arena status...");
    try {
      var result = await fetchLocal(
        "http://10.0.100.5:8080/api/matches/qualification",
        { timeout: 5000 }
      );
      var data = result.status === 200;
      if (data) {
        console.log("Cheesy Arena is available.");
        setCheesyArenaAvailable(true);
        return true;
      } else {
        console.log("Cheesy Arena is not available.");
        setCheesyArenaAvailable(false);
        return false;
      }
    } catch (error) {
      console.log("Error fetching Cheesy Arena status:", error.message);
      setCheesyArenaAvailable(false);
      return false;
    }
  };

  return {
    cheesyArenaAvailable,
    setCheesyArenaAvailable,
    useCheesyArena,
    setUseCheesyArena,
    cheesyTeamList,
    setCheesyTeamList,
    getCheesyStatus,
  };
}
