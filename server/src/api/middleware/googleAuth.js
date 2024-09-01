import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  '40464029355-e8r5tgkrodnleus86e0v1j70rcbgrbvt.apps.googleusercontent.com',
  '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',
  'http://localhost:3030/auth/callback'
);

export default oauth2Client;
