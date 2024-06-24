/**
 * Базовый класс для всех репозиториев
 */
export class BaseRepository {
    /** @var {string} _url адрес api */
    //_url = process.env.NODE_ENV == 'production' ? `${window.location.origin}/api/accesses` : 'https://bitrix.bsi.local/api/accesses';
    _url = process.env.NODE_ENV == 'production' ? `${window.location.origin}/api/accesses` : 'http://192.168.25.89/accesses';


    /** @var {string} _version версия api на бэке */
    _version = '';


    /** @var {string} _endpoint сущность, над которой будем работать */
    _endpoint = '';

    /**
     * @param {string} endpoint
     * @param {string} version
     */
    constructor(endpoint, version = 'v1') {
        this._endpoint = endpoint;
        this._version = version;
    }

    /**
     * nestedEndpoint?: string
     * @returns {module:url.URL}
     */
    _buildUrl(nestedEndpoint){
        return new URL(`${this._url}/${this._version}/${this._endpoint}` + (nestedEndpoint ? `/${nestedEndpoint}` : ''));
    }

    /**
     * @param {{
     * 	method?: 'GET'|'POST'|'PATCH'|'DELETE'
     * 	nestedEndpoint?: string
     * 	payload?: object
     * 	options?: object
     * }} param0
     * @returns {Promise<{ success: boolean, data?: any, message?:string, notify : { title:string, message?: string, type:string, duration?: string}}>}
     */
    async _query({
                     method= 'POST',
                     nestedEndpoint= '',
                     payload= null,
                     options= {download_file : false},
                     params= {},
                 } = {}) {

        const url = this._buildUrl(nestedEndpoint);

        let init = { method };

        if (params) {
            Object
                .entries(params)
                .forEach(([name, value]) => {
                    if (value) {
                        url.searchParams.append(name, value);
                    }
                });
        }

        if (payload) {
            let isFormData = payload instanceof FormData;

            isFormData ? payload.append('token', window.token) : payload.token = window.token;

            init = {
                ...init,
                body    : isFormData ? payload : JSON.stringify(payload, function(key, val) {
                    return (typeof val === 'function') ? ''+ val : val;
                }),
                headers : isFormData ? {} : {
                     'Accept': 'application/json',
                     'Content-Type': 'application/json;charset=utf-8',
                },
            };
        }

        const response = await fetch(url.href, init);

        return options.download_file? response : await response.json();
    }

}
