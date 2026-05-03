// Centralized API base URL — kept in its own module so both the auth
// provider and the HTTP client can import it without creating a cycle.
export const apiBaseUrl =
  process.env.REACT_APP_API_BASE || "https://api.gatool.org/v3/";
