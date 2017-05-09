import { Bookshelf } from './config';

export class User extends Bookshelf.Model<any> {
  get tableName() { return 'user'; }
  get hasTimestamps() { return true; }
}
