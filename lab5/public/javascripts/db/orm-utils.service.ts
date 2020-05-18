import { Service } from "typedi";
import { NullableProps, Nullable, Obj } from 'ts-typedefs';
import { Repository } from 'typeorm';
import { CoreObjData, PgUpdateResult, EntityFromRepo, PaginationInput, WhereParams } from "./interfaces";


@Service()
export class OrmUtilsService {

    constructor() {}

    /**
     * Removes properties that are defined as required in `TypeOrm.Entity`, but
     * are `null | undefined` in `obj`. This method mutates `obj` and returns it.
     *
     * @param repo Target entity repository.
     * @param obj  Target object to remove properties from.
     */
    removeNilFromRequiredProps
    <TObj extends Obj>
    (repo: Repository<TObj>, obj: NullableProps<TObj>): Partial<TObj> {
        for (const {propertyName, isNullable} of repo.metadata.columns) {
            if (!isNullable && propertyName in obj && obj[propertyName] == null) {
                delete obj[propertyName];
            }
        }
        return obj;
    }

    /**
     * Preforms an `UPDATE` query with the values from `upd` for the entity
     * found according to `whereParams`. You must ensure that the entity exists
     * before using this method. All nil properties are removed from `upd` if they
     * are required in database schema, thus `upd` gets mutated.
     *
     * @param repo Entity repository to update object in.
     * @param upd  Partial entity that contains update values.
     *             Nils are removed if those properties cannot be nullable.
     * @param whereParams `WHERE` clause conditions to find the target entity to update.
     */
    async updateOne<TEntityRepo extends Repository<any>>(
        repo: TEntityRepo,
        upd:  NullableProps<EntityFromRepo<TEntityRepo>>,
        ...whereParams: WhereParams<EntityFromRepo<TEntityRepo>>
    ): Promise<undefined | CoreObjData<EntityFromRepo<TEntityRepo>>> {

        const result: PgUpdateResult<EntityFromRepo<TEntityRepo>> = await repo
            .createQueryBuilder()
            .update(this.removeNilFromRequiredProps(repo, upd))
            .where(...whereParams)
            .returning('*')
            .execute();

        return result.raw.length === 0
            ? undefined
            : result.raw[0];
    }

    /**
     * Executes fast and effictient `DELETE` query without suppling
     * live entity to event subscribers attached to deleted tuple.
     * Returns `true` if deletion was successful, `false` otherwise.
     */
    async delete<TEntity extends Obj>(
        repo: Repository<TEntity>,
        ...whereParams: Parameters<Repository<TEntity>['delete']>
    ) {
        return 0 < (await repo.delete(...whereParams)).affected!;
    }

    /**
     * Returns a raw page of entites according to the given `PaginationInput` parameters.
     */
    async getPage<TEntity extends Obj>(
        repo: Repository<TEntity>,
        { limit, offset }: PaginationInput,
        ...whereParams: WhereParams<TEntity>
    ) {
        const tableAlias = repo.metadata.targetName;
        const [data, total] = await repo
            .createQueryBuilder(tableAlias)
            .where(...whereParams)
            .skip(offset)
            .take(limit)
            .getManyAndCount();
        return { data, total };
    }

}
