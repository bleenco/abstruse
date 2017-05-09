import * as bookshelf from 'bookshelf';
import * as knex from 'knex';
import { getConfig, getFilePath } from '../utils';

export function getDbConfig(): knex.Config {
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

  return dbConfig;
}

export function getKnex(): knex {
  return knex(getDbConfig());
}

export function getBookshelf(): bookshelf {
  return bookshelf(getKnex());
}
