export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://usetimebud.app";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://i.usetimebud.app";

// Set by the app (i.usetimebud.app) with `Domain=.usetimebud.app` and
// NOT HttpOnly, so client-side JS on this site can read it too. Presence +
// value "1" means "logged in somewhere on this browser" — it's a UI hint for
// showing the "Open App" button, not a trusted auth check (the real session
// cookie stays scoped to the app and stays HttpOnly).
export const APP_LOGIN_COOKIE_NAME = "tb_logged_in";
