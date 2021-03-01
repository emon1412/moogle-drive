import { isArray, isEmpty, keysIn } from 'lodash';
import { ItemNotFoundError, UpdateConflictError, MissingOrInvalidParameterError, CommonError } from '../utils/errors';
import MongoDbWrapper from './MongoDbWrapper';
import {  QueryOptions } from './QueryOptions';

const { ObjectID } = require('mongodb');

class MongoDbService {
  /**
   *
   * @param params
   */
  constructor(params = {}) {
    this._mongoDbWrapper = params.mongoDbWrapper || new MongoDbWrapper();
  }

  /**
   *
   * @param {String} collectionName
   * @param document
   * @returns {*}
   */
  async insert(collectionName, document) {
    try {
      console.log(`Inserting document into collection. [CollectionName: ${collectionName}] [Document: ${JSON.stringify(document)}]`);
      document._id = new ObjectID();
      const currentTime = new Date();
      document.createdOn = currentTime;
      document.updatedOn = currentTime;
      document.revision = 1;
      await this._mongoDbWrapper.insert(collectionName, document);
      const documentToReturn = Object.assign({}, document);
      documentToReturn._id = documentToReturn._id.toString();
      console.info('Completed Insert');
      return documentToReturn;
    } catch (error) {
      const newCommonError = new CommonError(error.message, error.name, error);
      console.error(`Unexpected error on MongoDbService.insert. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;

    }
  }


  /**
   *
   * @param {String} collectionName
   * @param {Object} [filter={}]
   * @param queryOptions
   * @returns {*}
   */
  async find(collectionName, filter = {}, queryOptions = new QueryOptions()) {
    try {
      console.log(
        `Finding documents into collection. [CollectionName: ${collectionName}] [Filter: ${JSON.stringify(
          filter
        )}] [QueryOptions: ${JSON.stringify(queryOptions)}]`
      );

      const foundDocuments = await this._mongoDbWrapper.find(collectionName, filter, queryOptions);
      return foundDocuments.map(document => {
        if (document._id) {
          document._id = document._id.toString();
        }
        return document;
      });
    } catch (error) {
      const newCommonError = new CommonError(error.message, error.name, error);
      console.error(`Unexpected error on MongoDbService.rawFind. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;

    }
  }

  /**
   *
   * @param {string} collectionName
   * @param {Object} filter
   * @param {Object} updateDoc
   * @return {Promise}
   */
  async update(collectionName, filter, updateDoc, options = {}) {
    console.log(`Calling mongoDbService.update. [Collection: ${collectionName}] [Filter: ${JSON.stringify(filter)}]`);
    try {
      const queryOptions = new QueryOptions();
      const [foundDocument] = await this._mongoDbWrapper.find(collectionName, filter, queryOptions);
      if (!foundDocument || isEmpty(foundDocument)) {
        throw new ItemNotFoundError('item not found');
      }

      if (foundDocument.revision !== updateDoc.revision) {
        throw new UpdateConflictError('update revision does not match current revision');
      }
      const setDoc = Object.assign({}, updateDoc, {
        createdOn: foundDocument.createdOn,
        revision: (updateDoc.revision += 1),
        updatedOn: new Date(),
      });

      const updateFilter = {
        _id: filter._id,
        revision: updateDoc.revision - 1,
      };

      const updateResult = await this._mongoDbWrapper.update(collectionName, updateFilter, { $set: setDoc }, options);
      console.log(`Returned beforeDoc [beforeDoc: ${JSON.stringify(foundDocument)}`);
      console.log(`Returned updateResult [updateResult: ${JSON.stringify(updateResult)}`);
      foundDocument._id = foundDocument._id.toString();
      updateResult.value._id = updateResult.value._id.toString();

      return {
        before: foundDocument,
        after: updateResult.value,
      };
    } catch (error) {
      const newCommonError = new CommonError(error.message, error.name, error);
      console.error(`Unexpected error on MongoDbService.update. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;

    }
  }

  /**
   *
   * @param {string} collectionName
   * @param {Object} filter
   * @returns {*}
   */
  async delete(collectionName, filter) {
    try {
      console.log(`Calling MongoDbService.Delete. [CollectionName: ${collectionName}] [Filter: ${JSON.stringify(filter)}]`);
      if (isEmpty(filter)) {
        throw new Error('Empty filter object not allowed on delete');
      }

      return await this._mongoDbWrapper.delete(collectionName, filter);
    } catch (error) {
      const newCommonError = new CommonError(error.message, error.name, error);
      console.error(`Unexpected error on MongoDbService.delete. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;

    }
  }
}

export default MongoDbService;
