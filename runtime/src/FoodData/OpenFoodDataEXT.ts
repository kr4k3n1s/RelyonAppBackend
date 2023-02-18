const request = require('request-promise')

const defaultOptions = {
  country: 'world',
  env: 'DEV'
}

const defaultQueryOptions = {
  params: [{key: 'json', value: 'true'}, {key: 'action', value: 'process'}],
  baseURL: `https://off:off@${defaultOptions.country}.openfoodfacts.net`,
}

const completness: OFFQueryParameter[] = [
  { key: 'tagtype_0', value: 'states' },
  { key: 'tag_contains_0', value: 'contains' },
  { key: 'tag_0', value: 'complete' }
];

type OFFQueryParameter = {
  key: string, value: any
};

export interface OFFQueryObject {
  params: OFFQueryParameter[];
  baseURL: string;
  func: string;
  pagination?: {page: Number, step: Number}
}

export class OFFQueryObject {

  constructor (func = 'cgi/search.pl', params = defaultQueryOptions.params, baseURL = defaultQueryOptions.baseURL) {
    this.params = params;
    this.params.push({key: 'json', value: 'true'});
    this.baseURL = baseURL;
    this.func = func;
  }

  paginate(currentPage: number, step: number){
    this.pagination = {page: Number(currentPage)+1, step: step};
    return this;
  }

  query(){
    return request(this._buildQuery());
  }

  private _buildQuery(): string {
    var query = `${this.baseURL}/${this.func}?`;
    this.params.forEach((param) => {
      query += `${param.key}=${param.value}&`
    })
    if(this.pagination){
      query += `page_size=${this.pagination.step}&page=${this.pagination.page}`
    }
    return query;
  }
}

export interface OFFExtended {
  options: any;
  URL: string;
}

export class OFFExtended {

    constructor (options = defaultOptions) {
      this.options = options
      this.URL = `off:off@https://${options.country}.openfoodfacts.net`
    }

    async getProducts(searchWord: string, fields?: string, paginate?: {currentPage: number, step: number}, sort?: {byField: string, order: string}, onlyComplete?: boolean) {
      var params: OFFQueryParameter[] = [
        { key: 'search_terms', value: searchWord },
        { key: 'action', value: 'process' },
        { key: 'fields', value: fields },
        { key: 'json', value: true },
        sort ? { key: 'sort_by', value: sort.byField} : {key: 'sort_by', value: ''},
      ] 
      console.log('INFO: ' + onlyComplete);
      if(onlyComplete){
        params.push(...completness);
      }

      var productQuery = paginate ? new OFFQueryObject('cgi/search.pl', params).paginate(paginate.currentPage, paginate.step) 
                                  : new OFFQueryObject('cgi/search.pl', params);

      var response = await productQuery.query();
      return JSON.parse(response);
    }
    
}