/**
 * Google OAuth2 Authentication Utility
 * 
 * This utility handles the refresh token flow to obtain fresh access tokens
 * for Google Business Profile API calls.
 */

interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

/**
 * Requests a new access token using the refresh token grant type.
 * 
 * @returns {Promise<string>} The fresh access_token.
 * @throws {Error} If environment variables are missing or the request fails.
 */
export async function getGoogleAccessToken(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error(
            'Google API credentials missing. Ensure GOOGLE_CLIENT_ID, ' +
            'GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set in .env.local'
        );
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        const authText = await response.text();
        let data: any;
        try {
            data = JSON.parse(authText);
        } catch (e) {
            console.error('Google Auth raw response (non-JSON):', authText);
            throw new Error(`Google Auth returned non-JSON response: ${authText}`);
        }

        if (!response.ok) {
            console.error('Google Auth Error Data:', data);
            throw new Error(`Failed to refresh Google access token: ${data.error_description || response.statusText}`);
        }

        return data.access_token;
    } catch (error) {
        console.error('getGoogleAccessToken error:', error);
        throw error;
    }
}
