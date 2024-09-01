import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  '',
  '',
  'http://localhost:3030/auth/callback'
);

export default oauth2Client;
