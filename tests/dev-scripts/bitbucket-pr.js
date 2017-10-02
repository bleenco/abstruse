require('../helpers/transpile');

const { request, headerPullRequestCreated } = require('../e2e/webhooks/bitbucket/PullRequestEvent');
const { sendBitBucketRequest } = require('../e2e/utils/utils');

sendBitBucketRequest(request, headerPullRequestCreated).then(() => console.log('Done.'));
