import {BaseRepository} from "./BaseRepository";

export class ModuleRepository extends BaseRepository {
    constructor() {
        super('modules');
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async add(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'add',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async attachRole(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'attach-role',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async detachRole(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'detach-role',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
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

    /**
     * @param {Object} payload
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
     * @return Promise<any>
     */
    async list() {
        const result = await this._query({
            nestedEndpoint: 'list',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }
}
