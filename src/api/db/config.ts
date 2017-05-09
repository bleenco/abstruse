import * as bookshelf from 'bookshelf';
import * as knex from 'knex';
import { configExists, writeDefaultConfig, getConfig, getFilePath } from '../utils';

if (!configExists()) {
  writeDefaultConfig();
}

let config: any = getConfig();
let dbConfig = Object.assign({}, config.db, {
  migrations: {
    tableName: 'knex_migrations',
    directory: getFilePath('migrations')
  }
});

if (dbConfig.connection.filename) {
  dbConfig.connection.filename = getFilePath(dbConfig.connection.filename);
}

export let Knex: knex = knex(dbConfig);
export let Bookshelf: bookshelf = bookshelf(Knex);
