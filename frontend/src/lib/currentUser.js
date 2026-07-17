// Matches the backend's hardcoded fake user (src/middleware/fakeUser.js, id=1).
// Every request the API receives is attributed to this user until real JWT
// auth is wired in - this constant is the single place that assumption lives
// on the frontend, so swapping it for a real session later is a one-file change.
export const CURRENT_USER_ID = '1';
