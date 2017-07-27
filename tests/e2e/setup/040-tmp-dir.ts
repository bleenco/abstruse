const temp = require('temp');

export default function() {
  let tempRoot = temp.mkdirSync('abstruse-e2e');
  console.log(`Using "${tempRoot}" as temporary directory for e2e tests.`);
  process.chdir(tempRoot);
}
