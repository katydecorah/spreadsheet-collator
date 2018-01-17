const google = require('googleapis');
const _ = require('underscore');
const queue = require('d3-queue').queue;
const utils = require('./utils.js');
const config = require('./config.js');

const feedback = (event, context, callback) => {
  utils
    .authorize() // authorize your account
    .then(listFeedback) // get the spreadsheet data
    .then(collateFeedback) // collate the feedback and create each file
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

const listFeedback = auth => {
  return new Promise((resolve, reject) => {
    let sheets = google.sheets('v4');
    sheets.spreadsheets.values.get(
      {
        auth: auth,
        spreadsheetId: config.spreadsheetId,
        range: config.spreadsheetRange
      },
      (err, response) => {
        if (err) return reject(`The API returned an error: ${err}`);
        const rows = response.values;
        if (rows.length === 0) return reject('No data found.');
        const data = toJSON(rows);
        const questions = rows[0];
        resolve({ auth: auth, data: data, questions: questions });
      }
    );
  });
};

const collateFeedback = res => {
  return new Promise((resolve, reject) => {
    const q = queue(1);
    const uniqueTalks = _.uniq(res.data, config.title);
    uniqueTalks.forEach(talk => {
      const filter = _.where(res.data, { [config.title]: talk[config.title] });
      // format it
      const response = module.exports.formatDoc(res.questions, filter);
      // upload it, defer the queue to avoid hitting rate limit
      q.defer(module.exports.uploadToDrive, res.auth, talk, response.join(''));
    });

    q.awaitAll((err, results) => {
      if (err) return reject(err);
      resolve(
        `Created ${results.length} Google Docs:\n${results.join(
          '\n'
        )}\n\nView your files: https://drive.google.com/drive/folders/${
          config.driveFolderId
        }`
      );
    });
  });
};

const uploadToDrive = (auth, talk, response, callback) => {
  google
    .drive({
      version: 'v3',
      auth: auth
    })
    .files.create(
      {
        resource: {
          name: talk[config.title],
          mimeType: 'application/vnd.google-apps.document',
          parents: [config.driveFolderId]
        },
        media: {
          mimeType: 'text/html',
          body: response
        }
      },
      err => {
        if (err) return callback(err);
        else return callback(null, talk[config.title]);
      }
    );
};

const formatDoc = (questions, data) => {
  const response = questions.reduce((arr, q) => {
    const learned = _.compact(_.keys(_.groupBy(data, q)));
    const answers = learned.map(l => '<li>' + l + '</li>');
    if (q !== config.title)
      arr.push('<h2>' + q + '</h2><ul>' + answers.join('') + '</ul>');
    return arr;
  }, []);
  return response;
};

const toJSON = arr => {
  let keys = arr[0];
  let values = arr.slice(1);
  let objects = values.map(array => {
    let object = {};
    keys.forEach((key, i) => (object[key] = array[i]));
    return object;
  });
  return objects;
};

module.exports = {
  feedback,
  uploadToDrive,
  formatDoc
};
