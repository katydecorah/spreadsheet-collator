#!/usr/bin/env node

let generate = require('../index.js');

generate.feedback({}, null, function(err, callback) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(callback);
});
