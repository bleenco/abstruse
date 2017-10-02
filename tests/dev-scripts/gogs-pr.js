require('../helpers/transpile');

const { pullRequestOpened, header } = require('../e2e/webhooks/gogs/PullRequestEvents');
const { sendGogsRequest } = require('../e2e/utils/utils');

sendGogsRequest(pullRequestOpened, header).then(() => console.log('Done.'));
