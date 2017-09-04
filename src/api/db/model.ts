import * as bookshelf from 'bookshelf';
import { Bookshelf } from './config';

export class User extends Bookshelf.Model<any> {
  get tableName() { return 'users'; }
  get hasTimestamps() { return true; }
  access_tokens() { return this.hasMany(AccessToken, 'users_id'); }
}

export class AccessToken extends Bookshelf.Model<any> {
  get tableName() { return 'access_tokens'; }
  get hasTimestamps() { return true; }
  user() { return this.belongsTo(User, 'users_id'); }
}

export class Repository extends Bookshelf.Model<any> {
  get tableName() { return 'repositories'; }
  get hasTimestamps() { return true; }
  access_token() { return this.belongsTo(AccessToken, 'access_tokens_id'); }
  builds() { return this.hasMany(Build, 'repositories_id'); }
  permissions() { return this.hasMany(Permission, 'repositories_id'); }
  variables() { return this.hasMany(EnvironmentVariable, 'repositories_id'); }
}

export class Build extends Bookshelf.Model<any> {
  get tableName() { return 'builds'; }
  get hasTimestamps() { return true; }
  static jsonColumns = ['data'];
  repository() { return this.belongsTo(Repository, 'repositories_id'); }
  jobs() { return this.hasMany(Job, 'builds_id'); }
  runs() { return this.hasMany(BuildRun, 'build_id'); }
}

export class BuildRun extends Bookshelf.Model<any> {
  get tableName() { return 'build_runs'; }
  get hasTimestamps() { return true; }
  static jsonColumns = ['data'];
  build() { return this.belongsTo(Build, 'build_id'); }
  job_runs() { return this.hasMany(JobRun, 'build_run_id'); }
}

export class Job extends Bookshelf.Model<any> {
  get tableName() { return 'jobs'; }
  get hasTimestamps() { return true; }
  build() { return this.belongsTo(Build, 'builds_id'); }
  runs() { return this.hasMany(JobRun, 'job_id'); }
}

export class JobRun extends Bookshelf.Model<any> {
  get tableName() { return 'job_runs'; }
  get hasTimestamps() { return true; }
  job() { return this.belongsTo(Job, 'job_id'); }
  build_run() { return this.belongsTo(BuildRun, 'build_run_id'); }
}

export class Permission extends Bookshelf.Model<any> {
  get tableName() { return 'permissions'; }
  get hasTimestamps() { return true; }
  repository() { return this.belongsTo(Repository, 'repositories_id'); }
  user() { return this.belongsTo(User, 'users_id'); }
}

export class Log extends Bookshelf.Model<any> {
  get tableName() { return 'logs'; }
  get hasTimestamps() { return true; }
}

export class EnvironmentVariable extends Bookshelf.Model<any> {
  get tableName() { return 'environment_variables'; }
  get hasTimestamps() { return true; }
  repository() { return this.belongsTo(Repository, 'repositories_id'); }
}
