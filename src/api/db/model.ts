import * as bookshelf from 'bookshelf';
import { Bookshelf } from './config';

export class User extends Bookshelf.Model<any> {
  get tableName() { return 'users'; }
  get hasTimestamps() { return true; }
}

export class Repository extends Bookshelf.Model<any> {
  get tableName() { return 'repositories'; }
  get hasTimestamps() { return true; }
  builds() { return this.hasMany(Build, 'repositories_id'); }
}

export class Build extends Bookshelf.Model<any> {
  get tableName() { return 'builds'; }
  get hasTimestamps() { return true; }
  repository() { return this.belongsTo(Repository, 'repositories_id'); }
  jobs() { return this.hasMany(Job, 'builds_id'); }
}

export class Job extends Bookshelf.Model<any> {
  get tableName() { return 'jobs'; }
  get hasTimestamps() { return true; }
  build() { return this.belongsTo(Build, 'builds_id'); }
}
