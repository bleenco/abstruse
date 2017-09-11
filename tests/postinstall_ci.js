const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const filePath = join('/etc/docker/daemon.json');
const obj = {
  "storage-driver": "overlay"
};

mkdirSync(join('/etc/docker'));
writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
