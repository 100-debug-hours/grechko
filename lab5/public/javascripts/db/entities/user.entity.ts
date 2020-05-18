import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { StringColumn } from '../decorators';

export enum UserRole { Admin, Registrator, Regular }

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid") id!: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.Regular })
    type = UserRole.Regular;

    @StringColumn() name!: string;
    @StringColumn() surname!: string;
    @StringColumn() address!: string;
    @StringColumn() password_hash!: string;
    @StringColumn() email!: string;
    @StringColumn() passport_id!: string;
    @StringColumn() taxes_card_id!: string;
    @Column({ default: false }) disabled!: boolean;


}


// INSERT INTO USERS VALUES("Admin", "root", "root_surname", "address", "")
// typ
// name
// surname
// address
// password_hash
// email
// passport_id
// taxes_card_id
