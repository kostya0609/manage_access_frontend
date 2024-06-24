import {BaseRepository} from "./BaseRepository";

export class DepartmentRepository extends BaseRepository {
    constructor() {
        super('departments', 'v1');
        this._url = 'https://bitrix.bsi.local/api';
    }

    /**
     * nestedEndpoint?: string
     * @returns {module:url.URL}
     */
    _buildUrl(nestedEndpoint){
        return new URL(`${this._url}/${this._endpoint}/${this._version}` + (nestedEndpoint ? `/${nestedEndpoint}` : ''));
    }

    /**
     * @param {string} query
     * @return Promise<any>
     */
    async search(query) {
        const result = await this._query({
            payload : {q : query},
            nestedEndpoint : 'search',
        });

        if (!result.success)
            throw new Error(result.message);

        return result.data;
    }

}