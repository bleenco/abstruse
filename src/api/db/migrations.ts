import * as knex from 'knex';
import { Bookshelf } from './config';

export function create(): Promise<null> {
  let schema: knex.SchemaBuilder = Bookshelf.knex.schema;

  return new Promise((resolve, reject) => {
    schema.createTableIfNotExists('users', (t: knex.TableBuilder) => {
      t.increments('id');
      t.string('email').unique().notNullable();
      t.string('fullname').notNullable();
      t.string('password').notNullable();
      t.boolean('admin').notNullable().defaultTo(false);
      t.string('avatar').notNullable().defaultTo('images/avatars/user.png');
      t.timestamps();
    })
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
