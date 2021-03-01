import MongoDbService from './MongoDbService';
import { ObjectID } from 'mongodb';
import { CommonError } from '../utils/errors';
import AlgoliaService from './AlgoliaService';
import { isEmpty, isString } from 'lodash';
import { createNameForDuplicate } from '../utils/stringUtils';
import { QueryOptions } from './QueryOptions';

class FilesMetadataService {
  constructor() {
    this._mongoDBService = new MongoDbService();
    this._algoliaService = new AlgoliaService();
  }

  /**
   * @param {Object} filter
   * @param {QueryOptions} queryOptions
   *
   * @returns {Array}
   *
   */
  async getByFilter(filter, queryOptions) {
    console.log(`Starting FilesMetadataService.getByFilter. [Filer: ${filter}]`);
    try {
      if (isString(filter._id)) {
        filter._id = new ObjectID(filter._id);
      }
      return await this._mongoDBService.find('FilesMetadata', filter, queryOptions);
    } catch (err) {
      const newCommonError = new CommonError(err.message, err.name, err);
      console.error(`Error in FilesMetadataService.getByFilter. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;
    }
  }

  /**
   * @param {Object} filter
   * @param {QueryOptions} queryOptions
   *
   * @returns {Object}
   *
   */
  async getById(dataObjectId, queryOptions) {
    console.log(`Starting FilesMetadataService.getById. [ID: ${dataObjectId}]`);
    try {
      let id = dataObjectId;
      if (isString(id)) {
        id = new ObjectID(id);
      }
      const result = await this._mongoDBService.find('FilesMetadata', { _id: id }, queryOptions);

      return result[0] || {}
    } catch (err) {
      const newCommonError = new CommonError(err.message, err.name, err);
      console.error(`Error in FilesMetadataService.getById. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;
    }
  }


  /**
   * @param {Object} fileMetadataObject
   *
   * @returns {Object}
   * 
   */
  async create(fileMetadataObject) {
    try {
      console.log(`Starting FilesMetadataService.create. [FileMetadata: ${JSON.stringify(fileMetadataObject)}]`);
      const [lastestFileWithSameName = {}] = await this._mongoDBService.find(
        'FilesMetadata',
        { name: { $regex: `${fileMetadataObject.name.split('.')[0]}` } },
        new QueryOptions({
          sort: {
            createdOn: -1,
          },
        })
      );
      const createdFileMetadata = await this._mongoDBService.insert(
        'FilesMetadata',
        {
          ...fileMetadataObject,
          extension: fileMetadataObject.type.split('/')[1],
          name: !isEmpty(lastestFileWithSameName) ? createNameForDuplicate(fileMetadataObject.name, lastestFileWithSameName) : fileMetadataObject.name
        }
      );
      await this._algoliaService.saveObject('FilesMetadata', createdFileMetadata);
      return createdFileMetadata
    } catch (error) {
      const newCommonError = new CommonError(error.message, error.name, error);
      console.error(`Error in FilesMetadataService.create. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;
    }
  }


  /**
   * @param {String} key
   * @param {QueryOptions} queryOptions
   *
   * @returns {Object}
   *
   */
  async updateByFilter(filter, updateDoc, queryOptions) {
    console.log(`Starting FilesMetadataService.updateByFilter. [Filer: ${filter}]`);
    try {
      if (isString(filter._id)) {
        filter._id = new ObjectID(filter._id);
      }
      delete updateDoc._id; 
      
      const { after: updatedFileMetadata } = await this._mongoDBService.update('FilesMetadata', filter, updateDoc, queryOptions);

      await this._algoliaService.saveObject('FilesMetadata', updatedFileMetadata);
      return updatedFileMetadata;
    } catch (err) {
      const newCommonError = new CommonError(err.message, err.name, err);
      console.error(`Error in FilesMetadataService.updateByFilter. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;
    }
  }

}

export default FilesMetadataService;
