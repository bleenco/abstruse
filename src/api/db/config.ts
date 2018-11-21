import * as bookshelf from 'bookshelf';
import * as knex from 'knex';
import * as setup from '../setup';
import * as jsonColumns from 'bookshelf-json-columns';

if (!setup.configExists()) {
  setup.writeDefaultConfig();
}

const config: any = setup.getConfig();
// const dbConfig = Object.assign({}, config.db, {
//   migrations: {
//     tableName: 'knex_migrations',
//     directory: setup.getFilePath('migrations')
//   }
// });

// if (dbConfig.connection.filename) {
//   dbConfig.connection.filename = setup.getFilePath(dbConfig.connection.filename);
// }
const dbConfig = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: 'xx2n5',
    database: 'abstruse',
    charset: 'utf8'
  },
  debug: false
};

export let Knex: knex = knex(dbConfig);
export let Bookshelf: bookshelf = bookshelf(Knex);

Bookshelf.plugin(jsonColumns);
