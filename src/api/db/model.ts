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
