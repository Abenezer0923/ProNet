/**
 * Script to generate Gmail API refresh token
 * 
 * Steps:
 * 1. Run: node scripts/generate-gmail-token.js
 * 2. Follow the URL to authorize
 * 3. Copy the refresh token to your .env file
 * 
 * Prerequisites:
 * - Google Cloud Project with Gmail API enabled
 * - OAuth 2.0 Client ID credentials
 */

const { google } = require('googleapis');
const readline = require('readline');

// Load from environment or replace with your values
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // For console apps

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes for Gmail API
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose'
];

console.log('\n🔐 Gmail API Token Generator\n');
console.log('═══════════════════════════════════════════════════════\n');

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force to get refresh token
});

console.log('📋 Step 1: Authorize this app by visiting this URL:\n');
console.log(authUrl);
console.log('\n═══════════════════════════════════════════════════════\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('📝 Step 2: Enter the authorization code from the page: ', async (code) => {
  try {
    console.log('\n⏳ Exchanging code for tokens...\n');
    
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Success! Here are your tokens:\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🔑 Refresh Token (add this to your .env file):\n');
    console.log(tokens.refresh_token);
    console.log('\n═══════════════════════════════════════════════════════\n');
    console.log('📝 Add this to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n═══════════════════════════════════════════════════════\n');
    
    if (tokens.access_token) {
      console.log('ℹ️  Access Token (temporary, expires in 1 hour):\n');
      console.log(tokens.access_token);
      console.log('\n');
    }
    
    console.log('✅ Done! Update your .env file and restart your server.\n');
    
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
  
  rl.close();
});
