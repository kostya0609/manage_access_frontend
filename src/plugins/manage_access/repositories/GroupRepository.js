import {BaseRepository} from "./BaseRepository";

export class GroupRepository extends BaseRepository {
    constructor() {
        super('roles');
    }

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async edit(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'edit',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async delete(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'delete',
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
    async all( payload,) {
        const result = await this._query({
           payload,
           nestedEndpoint: 'all',
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