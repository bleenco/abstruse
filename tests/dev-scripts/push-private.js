const request = require('request');
const crypto = require('crypto');
const data = require('./data/push-private.json');
const headers = require('./data/push-request-headers.json');

const secret = 'thisIsSecret';
const sig = crypto.createHmac('sha1', secret).update(JSON.stringify(data)).digest('hex');
headers['X-Hub-Signature'] = `sha1=${sig}`;

const options = {
  url: 'http://localhost:6500/webhooks/github',
  method: 'POST',
  headers: headers,
  json: data
};

request(options, (err, response, body) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Done.');
  }
});
