import { join } from 'path';


export default function() {
  process.chdir(join(__dirname, '../../..'));
}
