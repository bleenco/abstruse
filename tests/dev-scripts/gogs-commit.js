require('../helpers/transpile');

const { request, header } = require('../e2e/webhooks/gogs/PushEvents');
const { sendGogsRequest } = require('../e2e/utils/utils');

sendGogsRequest(request, header).then(() => console.log('Done.'));
