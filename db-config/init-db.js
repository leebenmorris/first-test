const bluebird = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: bluebird });

const dbCredentials = require('./db-config').local;
const db = pgp(dbCredentials);

const initDb = async () => {
  try {
    await db.none('DROP TABLE IF EXISTS returned_debit_items');
    await db.none('DROP TABLE IF EXISTS full_json');
    await db.none(`
      CREATE TABLE full_json (
      id SERIAL PRIMARY KEY,
      orig_doc_name TEXT,
      doc_json JSONB,
      post_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.none(`
      CREATE TABLE returned_debit_items (
      id SERIAL PRIMARY KEY,
      ref TEXT,
      item_json JSONB,
      doc_id INT,
      post_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doc_id) REFERENCES full_json(id)
    )`);
    await pgp.end();
    return 'db init completed successfully';
  }
  catch (err) { return err; }
};

module.exports = initDb;

initDb()
  .then(res => console.log(res))
  .catch(err => new Error(err));