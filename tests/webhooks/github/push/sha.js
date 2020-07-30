const crypto = require("crypto");
const payload = require("./webhook.json");
const secret = "73f5195de6";

const sig = crypto
  .createHmac("sha1", secret)
  .update(JSON.stringify(payload))
  .digest("hex");
console.log(sig);
