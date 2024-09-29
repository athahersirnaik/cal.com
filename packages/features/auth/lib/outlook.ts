// Outlook
export const OUTLOOK_API_CREDENTIALS = process.env.OUTLOOK_API_CREDENTIALS || "{}";
export const { client_id: OUTLOOK_CLIENT_ID, client_secret: OUTLOOK_CLIENT_SECRET } =
  JSON.parse(OUTLOOK_API_CREDENTIALS)?.web || {};
export const OUTLOOK_LOGIN_ENABLED = process.env.OUTLOOK_LOGIN_ENABLED === "true";
export const IS_OUTLOOK_LOGIN_ENABLED = !!(
  OUTLOOK_CLIENT_ID &&
  OUTLOOK_CLIENT_SECRET &&
  OUTLOOK_LOGIN_ENABLED
);
