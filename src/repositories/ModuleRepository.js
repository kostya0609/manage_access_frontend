import {BaseRepository} from "./BaseRepository";

export class ModuleRepository extends BaseRepository {
    constructor() {
        super('modules');
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
