import { PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn, Column } from "typeorm";
import { StringColumn } from "../decorators";
import { PubFormation } from "./pub-formation.entity";

@Entity()
export class Document {
    @PrimaryGeneratedColumn("uuid") id!: string;

    @ManyToOne(_type => PubFormation, { onDelete: 'CASCADE', lazy: true })
    @JoinColumn({ name: 'pf_id' })
    pf!: Promise<PubFormation>;
    @Column()
    pf_id!: string; // індентифікатор ГФ до якого відноситься цей документ

    @StringColumn() type!: string; // тип документу
    @StringColumn() name!: string; // назва документу
    @StringColumn() uri!: string; // посилання на ресурс для завантаження документу
}
