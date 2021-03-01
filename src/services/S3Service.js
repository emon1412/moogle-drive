import AWS from 'aws-sdk';
import Config from 'config';
import FilesMetadataService from './FilesMetadataService';
import { MissingOrInvalidParameterError, CommonError } from '../utils/errors';
import { createNameForDuplicate } from '../utils/stringUtils';
import { isEmpty } from 'lodash';
import { QueryOptions } from './QueryOptions';

class S3Service {
  constructor() {
    this._s3Client = new AWS.S3();
    this._filesMetadataService = new FilesMetadataService();
  }

  /**
   *
   * @param {String} name
   * @param {String} action
   * @param {Object} options
   * @returns {*|string|void}
   * 
   */
  async getUploadUrl({ name, type }) {
    try {
      console.log(
        `Starting S3Service.getUploadUrl. [Name: ${name}] [Type: ${type}]`
      );
      if (!name || !type) {
        throw new MissingOrInvalidParameterError(`Missing param to get upload url`);
      }

      const [ lastestFileWithSameName = {} ] = await this._filesMetadataService.getByFilter(
        { name: { $regex: `${name.split('.')[0]}` } },
        new QueryOptions({
          sort: {
            createdOn: -1,
          },
        })
      );
      const params = {
        Bucket: Config.filesBucket,
        Key: !isEmpty(lastestFileWithSameName) ? createNameForDuplicate(name, lastestFileWithSameName) : name,
        ContentType: type,
        Expires: 300
      };

      return this._s3Client.getSignedUrl('putObject', params);
    } catch (err) {
      const newCommonError = new CommonError(err.message, err.name, err);
      console.error(`Error in S3Service.getUploadUrl [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;
    }
  }

  /**
   *
   * @param {String} fileId
   * @returns {*|string|void}
   * 
   */
  async getDownloadUrl(fileId) {
    try {
      console.log(
        `Starting S3Service.getDownloadUrl. [FileId: ${fileId}]]`
      );
      if (!fileId) {
        throw new MissingOrInvalidParameterError(`Missing param to get download url.`);
      }

      const existingFile = await this._filesMetadataService.getById(fileId);
      const params = {
        Bucket: Config.filesBucket,
        Key: existingFile.name,
        Expires: 300
      };

      return this._s3Client.getSignedUrl('getObject', params);
    } catch (err) {
      const newCommonError = new CommonError(err.message, err.name, err);
      console.error(`Error in S3Service.getDownloadUrl [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;
    }
  }
}

export default S3Service;
