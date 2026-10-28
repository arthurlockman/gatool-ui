export function teamNumberParts(teamNumber, remapNumberToString, remapStringToNumber) {
  const number = remapStringToNumber ? remapStringToNumber(teamNumber) : teamNumber;
  const mapped = remapNumberToString ? remapNumberToString(number) : teamNumber;
  if (/^\d+$/.test(String(number)) && /^\d+[A-Za-z]+$/.test(String(mapped))) {
    return [String(number), String(mapped)];
  }
  return [mapped];
}

export function formatTeamNumber(teamNumber, remapNumberToString, remapStringToNumber) {
  return teamNumberParts(teamNumber, remapNumberToString, remapStringToNumber).join("/");
}
