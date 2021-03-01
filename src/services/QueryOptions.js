const MAX_PAGE_SIZE = 10000;


/**
 * @typedef {Object} QueryOptions
 * @property {number} Skip
 * @property {number} Limit
 * @property {number} Sort
 * @property {Object} Project
 */


/**
 *
 */
class QueryOptions {
  get Skip() {
    return this._skip;
  }

  set Skip(value) {
    this._skip = value;
  }

  get Limit() {
    return this._limit;
  }

  set Limit(value) {
    this._limit = value;
  }

  get Sort() {
    return this._sort;
  }

  set Sort(value) {
    this._sort = value;
  }

  get Project() {
    return this._project;
  }

  set Project(value) {
    this._project = value;
  }

  /**
   *
   * @param {Object} params
   * @param {number} params.skip Set to skip N documents ahead in your query.
   *        Note: If not provided, this value is defaulted to 0.
   * @param {number} params.limit Sets the limit of documents returned in the query.
   *        Note: This must be a valid number from 0 to N.  If N is greater than 100, it will be set to 100.
   * @param {Object<*>} params.sort  This field requires an object containing a document field to sort by and a direction.
   *        Note: 1 for ascending and -1 for descending
   *        Sample: { 'zipcode': 1 }
   * @param {Object<*>} params.project This field require an object containing a list of document fields and a true/false value.
   *        Note: 1 or true for inclusion and 0 or false for exclusion.
   *        Sample: { item: 1, _id: 0} would return an object with the item field and not the _id field.
   */
  constructor(params = {}) {
    const {skip = 0, limit = MAX_PAGE_SIZE, sort, project} = params;
    this._skip = skip;
    this._limit = limit;
    this._sort = sort;
    this._project = project;
  }
}

export { QueryOptions };
