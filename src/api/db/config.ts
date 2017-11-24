import * as bookshelf from 'bookshelf';
import * as knex from 'knex';
import * as setup from '../setup';
import * as jsonColumns from 'bookshelf-json-columns';

if (!setup.configExists()) {
  setup.writeDefaultConfig();
}

let config: any = setup.getConfig();
let dbConfig = Object.assign({}, config.db, {
  migrations: {
    tableName: 'knex_migrations',
    directory: setup.getFilePath('migrations')
  }
});

if (dbConfig.connection.filename) {
  dbConfig.connection.filename = setup.getFilePath(dbConfig.connection.filename);
}

export let Knex: knex = knex(dbConfig);
export let Bookshelf: bookshelf = bookshelf(Knex);

Bookshelf.plugin(jsonColumns);
