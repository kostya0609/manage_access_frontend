import {BaseRepository} from "./BaseRepository";

export class AccessesRepository extends BaseRepository {
    constructor() {
        super('users');
    }

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async rights(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'rights'
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

}



