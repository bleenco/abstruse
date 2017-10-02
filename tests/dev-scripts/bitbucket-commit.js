require('../helpers/transpile');

const { request, header } = require('../e2e/webhooks/bitbucket/PushEvent');
const { sendBitBucketRequest } = require('../e2e/utils/utils');

sendBitBucketRequest(request, header).then(() => console.log('Done.'));
