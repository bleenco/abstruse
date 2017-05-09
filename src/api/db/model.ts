import * as bookshelf from 'bookshelf';
import { Bookshelf } from './config';

export class User extends Bookshelf.Model<any> {
  get tableName() { return 'users'; }
  get hasTimestamps() { return true; }
}
