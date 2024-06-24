import {BaseRepository} from "./BaseRepository";

export class AdditionalRightRepository extends BaseRepository {
    constructor() {
        super('additional-rights');
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async set(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'set',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async list(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'list',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async get(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'get',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

}