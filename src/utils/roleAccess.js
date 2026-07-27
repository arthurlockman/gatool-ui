const ROLE_CLAIM = "https://gatool.org/roles";

export function hasRole(user, role) {
  const roles = user?.[ROLE_CLAIM];
  return Array.isArray(roles) && roles.includes(role);
}

export function canEditTeamData({ isAuthenticated, user, firstGlobalMode }) {
  if (!isAuthenticated) return false;
  if (firstGlobalMode) {
    return hasRole(user, "admin") ||
      (hasRole(user, "user") && hasRole(user, "firstglobal-write"));
  }
  return hasRole(user, "user");
}
