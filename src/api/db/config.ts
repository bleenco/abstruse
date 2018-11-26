import * as bookshelf from 'bookshelf';
import * as knex from 'knex';
import * as setup from '../setup';
import { JSONColumns } from './plugins/db-json-columns';

if (!setup.configExists()) {
  setup.writeDefaultConfig();
}

const config: any = setup.getConfig();
const dbConfig = Object.assign({}, config.db);

if (dbConfig.connection.filename) {
  dbConfig.connection.filename = setup.getFilePath(dbConfig.connection.filename);
}

// const dbConfig = {
//   client: 'pg',
//   connection: {
//     host: '127.0.0.1',
//     user: 'postgres',
//     password: 'xx2n5',
//     database: 'abstruse'
//   },
//   debug: false
// };

export let Knex: knex = knex(dbConfig);
export let Bookshelf: bookshelf = bookshelf(Knex);

Bookshelf.plugin(JSONColumns);
