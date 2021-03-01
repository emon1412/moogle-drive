'use strict';

class CommonError extends Error {
  /**
   *
   * @param {String} message
   * @param {String} givenName
   * @param {*} [internalError=null]
   * @param {number} [errorCode=0]
   */
  constructor(message, givenName, internalError = null, errorCode = 0) {
    super(message, givenName);
    this.rawMessage = message;
    this.name = givenName;
    this.errorCode = errorCode;
    this.internalError = internalError;
  }
}

class AccessNotAllowedError extends CommonError {
  static get errorName() {
    return 'AccessNotAllowed';
  }

  /**
   *
   * @param {String} message
   * @param {number} [errorCode=0]
   */
  constructor(message = '', errorCode = 401) {
    super(message, AccessNotAllowedError.errorName, null, errorCode);
  }
}

class DuplicateItemFoundError extends CommonError {
  static get errorName() {
    return 'DuplicateItemFound';
  }

  /**
   *
   * @param {String} message
   * @param {number} [errorCode=0]
   */
  constructor(message = '', errorCode = 400) {
    super(message, DuplicateItemFoundError.errorName, null, errorCode);
  }
}

class ItemNotFoundError extends CommonError {
  static get errorName() {
    return 'ItemNotFound';
  }

  /**
   *
   * @param {String} message
   * @param {number} [errorCode=0]
   */
  constructor(message, errorCode = 404) {
    super(message, ItemNotFoundError.errorName, null, errorCode);
  }
}

class ForbiddenStatusError extends CommonError {
  static get errorName() {
    return 'ForbiddenStatus';
  }

  /**
   *
   * @param {String} message
   * @param {number} [errorCode=0]
   */
  constructor(message, errorCode = 403) {
    super(message, ForbiddenStatusError.errorName, null, errorCode);
  }
}

class MissingOrInvalidParameterError extends CommonError {
  static get errorName() {
    return 'MissingOrInvalidParameter';
  }

  /**
   *
   * @param {String} message
   * @param {number} [errorCode=0]
   */
  constructor(message, errorCode = 400) {
    super(message, MissingOrInvalidParameterError.errorName, null, errorCode);
  }
}

class UpdateConflictError extends CommonError {
  static get errorName() {
    return 'UpdateConflict';
  }

  /**
   *
   * @param {String} message
   * @param {number} [errorCode=0]
   */
  constructor(message, errorCode = 409) {
    super(message, UpdateConflictError.errorName, null, errorCode);
  }
}

export {
  CommonError,
  AccessNotAllowedError,
  DuplicateItemFoundError,
  ItemNotFoundError,
  MissingOrInvalidParameterError,
  UpdateConflictError,
  ForbiddenStatusError,
};
