import config from 'config';
import { QueryOptions } from './QueryOptions';
import { DuplicateItemFoundError } from '../utils/errors';

import MongoFactory from './MongoFactory';

// This class wraps the mongoDB driver and the factory that provides connections.
class MongoDbWrapper {

  /**
   *
   * @param {string} collectionName
   * @param document
   * @returns {Promise|Promise.<T>}
   */
  insert(collectionName, document) {
    console.info(`Calling MongoDbWrapper.insert. [CollectionName: ${collectionName}] [Document: ${JSON.stringify(document)}]`);

    return this._getMongoCollection(collectionName)
      .then(collection => {
        console.info('Inserting');
        return collection.insertOne(document);
      })
      .catch(err => {
        if (err.message && err.message.includes('E11000')) {
          console.error(`Duplicate Item Error: ${JSON.stringify(err)}`);
          throw new DuplicateItemFoundError('Duplicate Item');
        }
        console.error(`Unknown error while inserting. [CollectionName: ${collectionName}] [Error: ${JSON.stringify(err)}]`);
        throw err;
      });
  }

  /**
   *
   * @param {string} collectionName
   * @param queryFilter
   * @param queryOptions
   * @returns {Promise|Promise.<T>}
   */
  find(collectionName, queryFilter, queryOptions = new QueryOptions()) {
    console.log(
      `Calling MongoDbWrapper.find. [CollectionName: ${collectionName}] [QueryFilter: ${JSON.stringify(
        queryFilter
      )}] [Query Options: ${JSON.stringify(queryOptions)}]`
    );

    return this._getMongoCollection(collectionName)
      .then(collection => this._getFindResults(collection, queryFilter, queryOptions))
      .then(results => {
        console.log(`Results from Collection. [CollectionName: ${collectionName}]`);
        return results;
      })
      .catch(err => {
        console.error(`Unexpected error in MongoDbWrapper.find. [CollectionName: ${collectionName}] [Error: ${JSON.stringify(err)}]`);
        throw err;
      });
  }

  /**
   *
   * @param collectionName
   * @param filter
   * @param updateDocument
   * @param options
   * @returns {Promise|Promise.<T>}
   */
  update(collectionName, filter, updateDocument, options = null) {
    console.log(
      `Calling MongoDbWrapper.update. [CollectionName: ${collectionName}] [Filter: ${JSON.stringify(filter)}] [Update: ${JSON.stringify(
        updateDocument
      )}] [Options: ${JSON.stringify(options)}]`
    );
    const localOptions = options || {};
    localOptions.returnOriginal = localOptions.returnOriginal || false;
    return this._getMongoCollection(collectionName)
      .then(collection => collection.findOneAndUpdate(filter, updateDocument, localOptions))
      .then(updateResult => updateResult)
      .catch(err => {
        console.error(`Unexpected error in MongoDbWrapper.update. [CollectionName: ${collectionName}] [Error: ${JSON.stringify(err)}]`);
        throw err;
      });
  }

  /**
   *
   * Note: at the layer that calls this (MongoDbService), we prevent calling with empty query
   * @param collectionName
   * @param filter
   * @returns {Promise|Promise.<T>}
   */
  delete(collectionName, filter) {
    console.log(`Calling MongoDbWrapper.delete. [CollectionName: ${collectionName}] [Filter: ${JSON.stringify(filter)}]`);

    return this._getMongoCollection(collectionName)
      .then(collection => collection.deleteOne(filter))
      .catch(err => {
        console.log(`Unexpected error in MongoDbWrapper.delete. [CollectionName: ${collectionName}] [Error: ${JSON.stringify(err)}]`);
        throw err;
      });
  }

  /**
   *
   * @param collectionName
   * @return {Promise.<TResult>|Promise}
   * @private
   */
  _getMongoCollection(collectionName) {
    console.info(`Getting collection [collectionname: ${collectionName}]`);
    const connectionString = config.MongoDBConnectionString;
    const databaseName = config.dbName;
    return MongoFactory.getConnection(connectionString, databaseName).then(db => {
      console.info('Returning collection connection');
      return db.collection(collectionName);
    });
  }

  /**
 *
 * @param collection
 * @param queryFilter
 * @param queryOptions
 * @return {Promise|exports}
 * @private
 */
  _getFindResults = (collection, queryFilter, queryOptions) =>
    new Promise((resolve, reject) => {
      collection
        .find(queryFilter)
        .sort(queryOptions.Sort)
        .skip(queryOptions.Skip)
        .limit(queryOptions.Limit)
        .project(queryOptions.Project)
        .toArray((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        });
    });

}

export default MongoDbWrapper;
