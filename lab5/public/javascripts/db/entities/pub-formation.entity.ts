import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { StringColumn } from '../decorators';
import { User } from './user.entity';

// type
// name
// residence_address
// phone_number
// activity_purpose
// status
// registration_certificate_id
// structural_cell_type
// affected_teritory
// members_amount
// arbitrages

// // registrator_id
// type
// registration_date
// name
// // executives
// residence_address
// phone_number
// activity_purpose
// // is_disabled
// disabling_reason
// status
// registration_certificate_id
// structural_cell_type
// affected_teritory
// members_amount
// arbitrages



@Entity()
export class PubFormation {
    @PrimaryGeneratedColumn("uuid") id!: string;

    @ManyToOne(_type => User, { onDelete: 'CASCADE', lazy: true })
    @JoinColumn({ name: 'registrator_id' })
    registrator!: Promise<User>;
    @Column()
    registrator_id!: string;

    @StringColumn()
    type!: string;

    @CreateDateColumn()
    registration_date!: Date;//timestamp not null default now(), -- дата реєстрації (легалізації)

    @Column()
    registration_paper_date!: Date;

    @Column()
    registration_evidence_date!: Date;

    @StringColumn()
    name!: string; // повне найменування формування

    @StringColumn({ nullable: true })
    executives?: null | string; // перелік та відомості про керівний склад (JSON)

    @StringColumn({ nullable: true })
    residence_address?: null | string; // адреса місця за який зареєстроване формування

    @StringColumn({ nullable: true })
    phone_number?: null | string; // номер телефону

    @StringColumn({ nullable: true })
    activity_purpose?: null | string; // мета діяльності

    @Column({ default: false })
    disabled!: boolean; // анулювання реєстрації

    @StringColumn({ nullable: true })
    registration_authority?: null | string;

    @StringColumn({ nullable: true })
    disabling_reason?: null | string; // причина анулювання реєстрації

    @StringColumn({ nullable: true })
    status?: null | string; // статус формування

    @StringColumn({ nullable: true, generated: "rowid"})
    registration_certificate_id!: number; // реєстраційний номер у відповідному

    @StringColumn({ nullable: true })
    foundators?: null | string;

    @StringColumn({ nullable: true })
    structural_cell_type?: null | string; // вид структурного осередку

    @StringColumn({ nullable: true })
    affected_teritory?: null | string; // озплюєма територія

    @StringColumn({ nullable: true, default: "0" })
    members_amount!: string // кількість учсаників формування

    @StringColumn({ nullable: true })
    arbitrages?: null | string; // відомості про третейських суддів


}
