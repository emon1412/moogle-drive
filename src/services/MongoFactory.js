/**
 * Creates and manages the Mongo connection pool
 *
 * @type {exports}
 */
import { MongoClient, ObjectID} from 'mongodb';
import { isEmpty, find } from 'lodash';

const AsyncLock = require('async-lock');
const lock = new AsyncLock();

// Store all instantiated connections.
const connections = [];
const LOCK_NAME = 'dblock';

const MongoFactory = function() {

  return {

    /**
     * Gets a Mongo connection from the pool.
     *
     * If the connection pool has not been instantiated yet, it is first
     * instantiated and a connection is returned.
     *
     * @returns {Promise|Db} - A promise object that resolves to a MongoDB object.
     */
    getConnection: function getConnection(connectionString, databaseName) {
      return lock.acquire(LOCK_NAME, () => {
        return new Promise((resolve, reject) => {
          // If connectionString is null or undefined, return an error.
          if (isEmpty(connectionString)) {
            return reject('getConnection must be called with a mongo connection string');
          }

          // Check if a connection already exists for the provided connectionString.
          const pool = find(connections, (conn) => { return conn.connectionString === connectionString; });
          // If a connection pool was found, resolve the promise with it.
          if (pool && pool.db && pool.db.serverConfig && pool.db.serverConfig.isConnected()) {
            return resolve(pool.db);
          }
          // If the connection pool has not been instantiated,
          // instantiate it and return the connection.
          MongoClient.connect(connectionString, { useNewUrlParser: true }, function (err, client) {
            if (err) {
              console.log(`Error connecting to MongoDb. [err: ${err.message}]`);
              return reject(err);
            }
            const database = client.db(databaseName);

            // Store the connection in the connections array.
            console.log(`[Mongo-Factory] Adding new connection.`);
            connections.push({
              connectionString: connectionString,
              db: database,
              createdDateTime: new Date().toISOString()
            });
            return resolve(database);
          });
        });
      }, {});
    },

    /**
     * Exposes Mongo ObjectID function.
     *
     * @returns {Function} - Mongo ObjectID function
     */
    ObjectID: function() {
      return ObjectID();
    }
  };
}();

export default MongoFactory;