// Local Database Configuration (Mocking Firebase)

// We mock the exported instances so the rest of the app doesn't break
export const auth = { currentUser: null };
export const db = {};
export const storage = {};
export const rtdb = {};
export let messaging = null;

const app = {};
export default app;
