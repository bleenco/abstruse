import * as knex from 'knex';
import { Bookshelf } from './config';

export function create(): Promise<null> {
  let schema: knex.SchemaBuilder = Bookshelf.knex.schema;

  return new Promise((resolve, reject) => {
    schema.createTableIfNotExists('users', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('email').notNullable();
      t.string('fullname').notNullable();
      t.string('password').notNullable();
      t.boolean('admin').notNullable().defaultTo(false);
      t.string('avatar').notNullable().defaultTo('/avatars/user.svg');
      t.timestamps();
    })
    .then(() => schema.createTableIfNotExists('access_tokens', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('description').notNullable();
      t.string('token').notNullable();
      t.integer('users_id').notNullable();
      t.foreign('users_id').references('users.id');
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('repositories', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('github_id');
      t.string('clone_url');
      t.string('html_url');
      t.string('default_branch');
      t.string('name');
      t.string('full_name');
      t.string('description');
      t.boolean('private');
      t.boolean('fork');
      t.string('user_login');
      t.string('user_id');
      t.string('user_avatar_url');
      t.string('user_url');
      t.string('user_html_url');
      t.integer('access_tokens_id');
      t.foreign('access_tokens_id').references('access_tokens.id');
      t.json('data');
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('builds', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('pr');
      t.integer('github_id');
      t.json('data');
      t.dateTime('start_time');
      t.dateTime('end_time');
      t.integer('repositories_id').notNullable();
      t.foreign('repositories_id').references('repositories.id');
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('build_runs', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('github_id');
      t.json('data');
      t.dateTime('start_time');
      t.dateTime('end_time');
      t.integer('build_id').notNullable();
      t.foreign('build_id').references('builds.id');
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('jobs', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('commands').notNullable();
      t.string('language');
      t.string('language_version');
      t.string('test_script');
      t.integer('builds_id').notNullable();
      t.foreign('builds_id').references('builds.id');
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('job_runs', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.dateTime('start_time').notNullable();
      t.dateTime('end_time');
      t.enum('status', ['queued', 'running', 'success', 'failed'])
        .notNullable().defaultTo('queue');
      t.text('log');
      t.integer('job_id').notNullable();
      t.foreign('job_id').references('job.id');
      t.integer('build_run_id').notNullable();
      t.foreign('build_run_id').references('build_run.id');
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('permissions', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('repositories_id').notNullable();
      t.foreign('repositories_id').references('repositories.id');
      t.integer('users_id').notNullable();
      t.foreign('users_id').references('users.id');
      t.boolean('read').notNullable().defaultTo(true);
      t.boolean('write').notNullable().defaultTo(true);
      t.boolean('execute').notNullable().defaultTo(true);
      t.timestamps();
    }))
    .then(() => resolve())
    .catch(err => {
      console.error(err);
      reject();
    });
  });
}

export function dropTables(): Promise<null> {
  let schema: knex.SchemaBuilder = Bookshelf.knex.schema;

  return new Promise((resolve, reject) => {
    schema.dropTableIfExists('user')
      .then(() => resolve());
  });
}

export function reinitializeDatabase(): Promise<null> {
  return dropTables().then(() => create());
}
