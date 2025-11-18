
// Safar Sar Application Configuration

/**
 * Google OAuth Client ID for authentication.
 * This ID is safe to be publicly exposed on the client-side.
 */
export const GOOGLE_CLIENT_ID = "100492211024-c7pnuqins6qbirknlvaq9b7o676oslj1.apps.googleusercontent.com";

/**
 * --- CRITICAL SECURITY NOTE ---
 * The `CLIENT_SECRET` provided by the user is NOT included here.
 * A Client Secret must NEVER be exposed in frontend (client-side) code.
 * It is a secret credential intended only for backend servers.
 * 
 * The authentication flow used in this application is the "Token" or "Implicit" flow,
 * which is designed for client-side applications and only requires the Client ID.
 */
