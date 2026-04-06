require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_DSN || './finance.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_DSN || './finance.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;', done);
      }
    }
  }
};
