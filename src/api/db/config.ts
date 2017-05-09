import * as bookshelf from 'bookshelf';
import * as knex from 'knex';
import { getConfig, getFilePath } from '../utils';

let config: any = getConfig();

export let dbConfig: knex.Config = Object.assign({}, config.db, {
  migrations: {
    tableName: 'knex_migrations',
    directory: getFilePath('migrations')
  }
});

export let Knex: knex = knex(dbConfig);
export let Bookshelf: bookshelf = bookshelf(Knex);
