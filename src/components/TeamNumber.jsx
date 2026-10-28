import { teamNumberParts } from "../utils/teamNumberDisplay";

export default function TeamNumber({ teamNumber, remapNumberToString }) {
  const [number, suffix] = teamNumberParts(teamNumber, remapNumberToString);
  if (!suffix) return <>{number}</>;
  return (
    <span className="teamNumberStack">
      <span>{number}</span>
      <span className="teamNumberSuffix">{suffix}</span>
    </span>
  );
}
