import * as bookshelf from 'bookshelf';
import { Bookshelf } from './config';

export class User extends Bookshelf.Model<any> {
  get tableName() { return 'users'; }
  get hasTimestamps() { return true; }
}

export class Repository extends Bookshelf.Model<any> {
  get tableName() { return 'repositories'; }
  get hasTimestamps() { return true; }
}

export class Build extends Bookshelf.Model<any> {
  get tableName() { return 'builds'; }
  get hasTimestamps() { return true; }
}
