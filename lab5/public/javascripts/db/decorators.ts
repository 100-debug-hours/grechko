import { ColumnOptions, Column  } from 'typeorm';

export function StringColumn(opts?: ColumnOptions) {
    return Column({ type: 'varchar', ...opts })
}
