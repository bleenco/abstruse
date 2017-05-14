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
      t.string('avatar').notNullable().defaultTo('images/avatars/user.png');
      t.timestamps();
    })
    .then(() => schema.createTableIfNotExists('repositories', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('url').notNullable();
      t.string('default_branch').notNullable().defaultTo('master');
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('permissions', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.integer('repositories_id').notNullable();
      t.foreign('repositories_id').references('repositories.id');
      t.integer('users_id').notNullable();
      t.foreign('users_id').references('users.id');
      t.boolean('read').notNullable().defaultTo(true);
      t.boolean('start').notNullable().defaultTo(true);
      t.boolean('stop').notNullable().defaultTo(true);
      t.boolean('delete').notNullable().defaultTo(false);
      t.timestamps();
    }))
    .then(() => schema.createTableIfNotExists('builds', (t: knex.TableBuilder) => {
      t.increments('id').unsigned().primary();
      t.string('uuid').notNullable();
      t.string('branch').notNullable();
      t.string('commit_hash');
      t.string('commited_by');
      t.dateTime('start_time').notNullable();
      t.dateTime('end_time');
      t.integer('iteration').notNullable().defaultTo(1);
      t.enum('status', ['queue', 'starting', 'running', 'stopped', 'success', 'failed'])
       .notNullable().defaultTo('queue');
      t.integer('repositories_id').notNullable();
      t.foreign('repositories_id').references('repositories.id');
      t.text('log');
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
