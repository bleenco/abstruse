import * as knex from 'knex';
import { Bookshelf } from './config';

let schema: knex.SchemaBuilder = Bookshelf.knex.schema;

export function create(): Promise<null> {
  return new Promise((resolve, reject) => {
    schema.createTableIfNotExists('user', (t: knex.TableBuilder) => {
      t.increments('id');
      t.string('email').unique().notNullable();
      t.string('fullname').notNullable();
      t.string('password').notNullable();
      t.string('avatar');
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
  return new Promise((resolve, reject) => {
    schema.dropTableIfExists('user')
      .then(() => resolve());
  });
}

export function reinitializeDatabase(): Promise<null> {
  return dropTables().then(() => create());
}
