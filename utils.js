const fs = require('fs');
const readline = require('readline');
const googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/spreadsheet-collator.json
let SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive'
];
let TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'spreadsheet-collator.json';

const authorize = () => {
  return new Promise((resolve, reject) => {
    // Load client secrets from a local file.
    fs.readFile('./client_secret.json', function processClientSecrets(
      err,
      content
    ) {
      if (err) return reject('Error loading client secret file: ' + err);
      // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
      const credentials = JSON.parse(content);
      let clientSecret = credentials.installed.client_secret;
      let clientId = credentials.installed.client_id;
      let redirectUrl = credentials.installed.redirect_uris[0];
      let auth = new googleAuth();
      let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          module.exports.getNewToken(oauth2Client);
        } else {
          oauth2Client.credentials = JSON.parse(token);
          return resolve(oauth2Client);
        }
      });
    });
  });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
const getNewToken = oauth2Client => {
  return new Promise((resolve, reject) => {
    let authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', code => {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
        if (err)
          return reject(`Error while trying to retrieve access token: ${err}`);
        oauth2Client.credentials = token;
        module.exports.storeToken(token);
        resolve(oauth2Client);
      });
    });
  });
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = token => {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
};

module.exports = {
  authorize,
  getNewToken,
  storeToken
};
