
import {
    Obj, Op, FilterProps, Func, ClassDecorator, PropertyDecorator,
    AccessorDecorator, MethodDecorator, ParameterDecorator, Merge, RemoveKeys
} from 'ts-typedefs';
import { Repository, UpdateResult, UpdateQueryBuilder } from 'typeorm';

export type CoreObjData<TObj extends Obj> = FilterProps<
    TObj,
    Op.NotExtends<Func<any, any, TObj>>
>;
export type Decorator = (
    | ClassDecorator
    | PropertyDecorator
    | AccessorDecorator
    | MethodDecorator
    | ParameterDecorator
);

export type CoreEntityData<TEntity extends Obj> = CoreObjData<
    RemoveKeys<TEntity, 'id' | 'creationDate' | 'lastUpdateDate'>
>;

export type EntityFromRepo<TRepo extends Repository<any>> = ReturnType<TRepo['create']>;

export type PgUpdateResult<
    TEntity extends Obj = Obj, TReturnedColNames extends keyof TEntity = keyof TEntity
> = Merge<UpdateResult, { raw: Pick<TEntity, TReturnedColNames>[] }>;

export interface PaginationInput {
    limit: number;
    offset: number;
}

export type WhereParams<TEntity> = Parameters<UpdateQueryBuilder<TEntity>["where"]>
