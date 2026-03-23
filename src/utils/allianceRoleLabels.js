/**
 * World Championship and its division events use FIRST’s “Round 3 Selection” wording;
 * all other events use “Reserve Team” in the UI for the same alliance slot.
 *
 * @param {{ champLevel?: string } | null | undefined} eventValue selectedEvent.value
 */
export function isWorldChampsOrDivisionEvent(eventValue) {
  const cl = eventValue?.champLevel;
  return cl === "CHAMPS" || cl === "CMPDIV" || cl === "CMPSUB";
}

/**
 * Label for alliances.Lookup[].role (and matching UI copy) for the round-3 / reserve slot.
 * @param {{ champLevel?: string } | null | undefined} eventValue selectedEvent.value
 */
export function roundThreeOrReserveRoleLabel(eventValue) {
  return isWorldChampsOrDivisionEvent(eventValue)
    ? "Round 3 Selection"
    : "Reserve Team";
}
