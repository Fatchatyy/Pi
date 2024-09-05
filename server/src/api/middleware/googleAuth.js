import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID); 
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,      // Accessing the client ID from .env
  process.env.GOOGLE_CLIENT_SECRET,  // Accessing the client secret from .env
  process.env.GOOGLE_REDIRECT_URI 
);

export default oauth2Client;
