import * as bookshelf from 'bookshelf';
import * as knex from 'knex';
import * as utils from '../utils';
import * as jsonColumns from 'bookshelf-json-columns';

if (!utils.configExists()) {
  utils.writeDefaultConfig();
}

let config: any = utils.getConfig();
let dbConfig = Object.assign({}, config.db, {
  migrations: {
    tableName: 'knex_migrations',
    directory: utils.getFilePath('migrations')
  }
});

if (dbConfig.connection.filename) {
  dbConfig.connection.filename = utils.getFilePath(dbConfig.connection.filename);
}

export let Knex: knex = knex(dbConfig);
export let Bookshelf: bookshelf = bookshelf(Knex);

Bookshelf.plugin(jsonColumns);
