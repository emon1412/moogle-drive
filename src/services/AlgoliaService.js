import Config from 'config';
import __ from 'lodash'
import Algolia from 'algoliasearch'
import { CommonError } from '../utils/errors';

class AlgoliaService {
  constructor() {
    this._client = Algolia(Config.Algolia.AppID, Config.Algolia.APIKey);
  }

  _setObjectId = data => {
    if (__.isArray(data)) {
      return data.map(item => ({ ...item, objectID: item._id }));
    }
    return {
      ...data,
      objectID: data._id,
    };
  };

  getObjects(indexName, objectIDs, properties) {
    const index = this._client.initIndex(indexName);
    return index.getObjects(objectIDs, { attributesToRetrieve: properties });
  }

  deleteObjects(indexName, arrayOfIds) {
    const index = this._client.initIndex(indexName);
    return index.deleteObjects(arrayOfIds);
  }

  /**
   *
   * @param {String} indexName
   * @param {Object} data
   * 
   */
  async saveObject(indexName, data) {
    console.log(`Starting AlgoliaService.saveObject. [IndexName: ${indexName}] [Data: ${JSON.stringify(data)}]`);
    try {
      const newData = this._setObjectId(data);
      const index = this._client.initIndex(indexName);
      return await index.saveObject(newData);
    } catch (err) {
      const newCommonError = new CommonError(err.message, err.name, err);
      console.error(`Error in AlgoliaService.saveObject. [Error: ${JSON.stringify(newCommonError)}]`);
      throw newCommonError;
    }
  };
}

export default AlgoliaService;
