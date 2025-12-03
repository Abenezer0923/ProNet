const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Try to read .env file for defaults
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in your .env file.');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = ['https://mail.google.com/'];

function getAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent', // Force refresh token generation
    });
}

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/oauth2callback')) {
        const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
        const code = qs.get('code');

        if (code) {
            res.end('Authentication successful! You can close this tab and check your terminal.');

            try {
                const { tokens } = await oauth2Client.getToken(code);
                console.log('\n✅ Authentication successful!');
                console.log('\n🔑 YOUR REFRESH TOKEN:');
                console.log('====================================================');
                console.log(tokens.refresh_token);
                console.log('====================================================');
                console.log('\n👉 Add this to your Render Environment Variables as GOOGLE_REFRESH_TOKEN');

                if (!tokens.refresh_token) {
                    console.warn('\n⚠️ No refresh token returned. Did you already authorize this app?');
                    console.warn('Try revoking access for this app in your Google Account permissions and try again.');
                }

            } catch (error) {
                console.error('Error retrieving access token', error);
            } finally {
                server.close();
                process.exit(0);
            }
        }
    }
});

server.listen(3000, () => {
    const authUrl = getAuthUrl();
    console.log('🚀 Starting OAuth flow...');
    console.log(`\n👉 Open this URL in your browser:\n\n${authUrl}\n`);
    console.log('Waiting for authentication...');
});
