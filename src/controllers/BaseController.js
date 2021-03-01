import { isEmpty, get } from 'lodash';

import {
  MissingOrInvalidParameterError,
  DuplicateItemFoundError,
  ItemNotFoundError,
  UpdateConflictError,
  AccessNotAllowedError,
  ForbiddenStatusError,
  CommonError,
} from '../utils/errors';

class BaseController {
  /**
   *
   * @param {Object} request
   * @protected
   */
  _getBody = request => {
    const body = get(request, 'body', {}) || {};
    if (isEmpty(body)) {
      throw new MissingOrInvalidParameterError('Missing document in request.body.  Body must be populated with a non-empty object.');
    }

    return body;
  };

  /**
   *
   * @param {Object} request
   * @param {Object} [request.params]
   * @protected
   */
  _getParams = request => {
    console.info(`Request.Params Type: ${typeof request.params}`);
    return request.params;
  };

  /**
   *
   * @param {Object} request
   * @param {Object} [request.query]
   * @protected
   */
  _getQuery = request => {
    console.info(`Request.Query Type: ${typeof request.query}`);
    return request.query;
  };

  /**
   *
   * @param {Object} request
   * @return {string}
   * @protected
   */
  _getId = (request = {}) => {
    const paramsId = request.params && request.params.id;
    if (!paramsId || paramsId === 'undefined') {
      return '';
    }

    return paramsId;
  };

  /**
   *
   * @param res
   * @param err
   * @param next
   * @protected
   */
  _errorHandler(res, err) {
    // console.log(err, 'err')
    let statusCode = 500;
    if (err && err.name === MissingOrInvalidParameterError.errorName) {
      statusCode = 400;
    } else if (err && err.name === AccessNotAllowedError.errorName) {
      statusCode = 401;
    } else if (err && err.name === ItemNotFoundError.errorName) {
      statusCode = 404;
    } else if (err && err.name === UpdateConflictError.errorName) {
      statusCode = 409;
    } else if (err && err.name === DuplicateItemFoundError.errorName) {
      statusCode = 400;
    } else if (err && err.name === ForbiddenStatusError.errorName) {
      statusCode = 403;
    }
    console.error(`ErrorHandler: ${JSON.stringify(new CommonError(err.message, err.name, err))} [Status: ${statusCode}]`);
    res.status(statusCode).send(err);
  }
}

export default BaseController;
