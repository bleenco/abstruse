import * as knex from 'knex';
import { Knex } from './config';

export function create(): Promise<null> {
  return new Promise((resolve, reject) => {
    Knex.schema.createTableIfNotExists('users', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('email').notNullable();
      t.string('fullname').notNullable();
      t.string('password').notNullable();
      t.boolean('admin').notNullable().defaultTo(false);
      t.string('avatar').notNullable().defaultTo('/avatars/user.svg');
      t.timestamps();
    })
    .then(() => Knex.schema.createTableIfNotExists('access_tokens', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('description').notNullable();
      t.string('token');
      t.string('gitlab_username');
      t.string('bitbucket_client_id');
      t.string('bitbucket_oauth_key');
      t.string('bitbucket_oauth_secret');
      t.enum('type', ['github', 'gitlab', 'bitbucket', 'gogs']);
      t.timestamps();
      t.integer('users_id').unsigned().notNullable();
      t.foreign('users_id').references('users.id').onDelete('cascade');
    }))
    .then(() => Knex.schema.createTableIfNotExists('repositories', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('github_id');
      t.string('bitbucket_id');
      t.integer('gitlab_id');
      t.integer('gogs_id');
      t.string('clone_url');
      t.string('html_url');
      t.string('default_branch');
      t.string('name');
      t.string('full_name');
      t.string('description');
      t.string('api_url');
      t.enum('repository_provider', ['github', 'gitlab', 'bitbucket', 'gogs']);
      t.boolean('private').notNullable().defaultTo(false);
      t.boolean('fork');
      t.string('user_login');
      t.string('user_id');
      t.string('user_avatar_url');
      t.string('user_url');
      t.string('user_html_url');
      t.integer('access_tokens_id').unsigned();
      t.foreign('access_tokens_id').references('access_tokens.id');
      t.boolean('public').notNullable().defaultTo(true);
      t.json('data');
      t.timestamps();
    }))
    .then(() => Knex.schema.createTableIfNotExists('builds', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('branch');
      t.integer('pr');
      t.integer('head_id');
      t.json('data');
      t.json('parsed_config');
      t.dateTime('start_time');
      t.dateTime('end_time');
      t.integer('repositories_id').unsigned().notNullable();
      t.foreign('repositories_id').references('repositories.id');
      t.timestamps();
    }))
    .then(() => Knex.schema.createTableIfNotExists('build_runs', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('head_id');
      t.dateTime('start_time');
      t.dateTime('end_time');
      t.integer('build_id').unsigned().notNullable();
      t.foreign('build_id').references('builds.id');
      t.timestamps();
    }))
    .then(() => Knex.schema.createTableIfNotExists('jobs', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.text('data');
      t.integer('builds_id').unsigned().notNullable();
      t.foreign('builds_id').references('builds.id');
      t.timestamps();
    }))
    .then(() => Knex.schema.createTableIfNotExists('job_runs', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.dateTime('start_time').notNullable();
      t.dateTime('end_time');
      t.enum('status', ['queued', 'running', 'success', 'failed']).notNullable().defaultTo('queued');
      t.text('log');
      t.integer('job_id').unsigned().notNullable();
      t.foreign('job_id').references('jobs.id');
      t.integer('build_run_id').unsigned().notNullable();
      t.foreign('build_run_id').references('build_runs.id');
      t.timestamps();
    }))
    .then(() => Knex.schema.createTableIfNotExists('permissions', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('repositories_id').unsigned().notNullable();
      t.foreign('repositories_id').references('repositories.id');
      t.integer('users_id').unsigned().notNullable();
      t.foreign('users_id').references('users.id');
      t.boolean('permission').notNullable().defaultTo(true);
      t.timestamps();
    }))
    .then(() => Knex.schema.createTableIfNotExists('logs', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.enum('type', ['info', 'warning', 'error']).notNullable();
      t.text('message').notNullable();
      t.boolean('notify').notNullable().defaultTo(false);
      t.boolean('read').notNullable().defaultTo(false);
      t.timestamps();
    }))
    .then(() => Knex.schema.createTableIfNotExists('environment_variables', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('repositories_id').unsigned().notNullable();
      t.foreign('repositories_id').references('repositories.id');
      t.string('name').notNullable();
      t.string('value').notNullable();
      t.boolean('encrypted').notNullable().defaultTo(false);
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
  return new Promise((resolve, reject) => {
    Knex.schema.dropTableIfExists('user')
      .then(() => resolve());
  });
}

export async function reinitializeDatabase(): Promise<null> {
  return dropTables().then(() => create());
}
