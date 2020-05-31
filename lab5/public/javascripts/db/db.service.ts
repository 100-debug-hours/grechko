import { createConnection, Connection, Repository, Like } from "typeorm";
import { Document } from "./entities/document.entity";
import { PubFormation } from "./entities/pub-formation.entity";
import { User } from "./entities/user.entity";
import { Service } from "typedi";
import { DeepPartial, Required, NullableProps } from "ts-typedefs";
import { OrmUtilsService } from "./orm-utils.service";
import { pbkdf2Sync } from "crypto";

@Service()
export class DbService {
    connection!: Connection;

    constructor(private readonly orm: OrmUtilsService) {}

    private get pubFormations(): Repository<PubFormation> {
        return this.connection.getRepository(PubFormation);
    }
    private get users(): Repository<User> {
        return this.connection.getRepository(User);
    }
    private get documents(): Repository<Document> {
        return this.connection.getRepository(Document);
    }

    async connect() {
        this.connection = await createConnection({
            type: "postgres",
            host: "127.1.1.1",
            port: 5432,
            username: "admin",
            password: "admin",
            entities: [Document, PubFormation, User],
            synchronize: true,
            logging: ["query", "info", "error", "warn"]
        });
    }

    private toQuery(fieldName: string, q: string) {
        return q.trim() === '' ? "true" : { [fieldName]: Like(`%${q.trim()}%`) };
    }

    async getAllPubFormations(searchQuery: string): Promise<PubFormation[]> {
        return (await this.orm.getPage(
            this.pubFormations, {
                limit: 500,
                offset: 0
            },
            this.toQuery("name", searchQuery)
        ))
        .data;
    }

    async getAllUsers(searchQuery: string): Promise<User[]> {
        return (await this.orm.getPage(
            this.users, {
                limit: 500,
                offset: 0
            },
            this.toQuery("email", searchQuery)
        ))
        .data;
    }

    async getPubFormationById(id: string): Promise<undefined | PubFormation> {
        return await this.pubFormations.findOne(id);
    }

    async getUserById(id: string): Promise<undefined | User> {
        return await this.users.findOne(id);
    }

    async getUserByEmailAndPassword(email: string, password_hash: string): Promise<undefined | User> {
        return await this.users.findOne({ where: { email, password_hash} })
    }

    async getDocumentById(id: string): Promise<undefined | Document> {
        return await this.documents.findOne(id);
    }

    async createPubFormation(pubFormation: Omit<PubFormation, "id">): Promise<PubFormation> {
        pubFormation.registration_evidence_date = new Date();
        pubFormation.registration_evidence_date.setDate(Math.random() * 27);

        pubFormation.registration_paper_date = new Date();
        pubFormation.registration_paper_date.setMonth(Math.random() * 11);

        return await this.pubFormations.save(pubFormation);
    }

    async createUser(user: Omit<User, "id">): Promise<User> {
        return await this.users.save(user);
    }

    async createDocument(doc: Omit<Document, "id">): Promise<Document> {
        return await this.documents.save(doc);
    }



    async updatePubFormation(
        { id, ...pubFormation }: Required<NullableProps<PubFormation>, "id">
    ): Promise<undefined | PubFormation> {
        return await this.orm.updateOne(this.pubFormations, pubFormation, 'id = :id', {id});
    }

    async updateUser(
        { id, ...user }: Required<NullableProps<User>, "id">
    ): Promise<undefined | User> {
        return await this.orm.updateOne(this.users, user, 'id = :id', {id});
    }

    async updateDocument(
        { id, ...document }: Required<NullableProps<Document>, "id">
    ): Promise<undefined | Document> {
        return await this.orm.updateOne(this.documents, document, 'id = :id', {id});
    }


    async deleteUser(id: string): Promise<boolean> {
        return await this.orm.delete(this.users, {id});
    }

    async deletePubFormation(id: string): Promise<boolean> {
        return await this.orm.delete(this.pubFormations, {id});
    }

    async deleteDocument(id: string): Promise<boolean> {
        return await this.orm.delete(this.documents, {id});
    }
}


// create table users (
//     id uuid not null primary key, -- ідентифікатор користувача
//     type text not null, -- роль користувача (реєстратор, адмінстратор, інший)
//     name text not null, -- ім'я
//     surname text not null, -- призвіще
//     address text not null, -- адреса проживання
//     password_hash text not null, -- хєш пароля користувача
//     email text not null unique, -- поштова скринька
//     passport_id text not null, -- номер паспорту
//     taxes_card_id text not null    -- номер картки платника податків
// );

// create table pub_formations (
//     id uuid not null primary key, -- унікальний ідетифікатор формування
//     registrator_id uuid not null references users(id), -- ідентифікатор реєстратора
//     type text not null, -- тип формування (політична партія, благодійна організація, творча спілка і т.д...)
//     registration_date timestamp not null default now(), -- дата реєстрації (легалізації)
//     name text not null, -- повне найменування формування
//     executives json, -- перелік та відомості про керівний склад
//     residence_address text, -- адреса місця за який зареєстроване формування
//     phone_number text, -- номер телефону
//     activity_purpose text, -- мета діяльності
//     is_disabled bool default false, -- анулювання реєстрації
//     disabling_reason text, -- причина анулювання реєстрації
//     status text, -- статус формування
//     registration_certificate_id text, -- реєстраційний номер у відповідному
//     structural_cell_type text, -- вид структурного осередку
//     affected_teritory text, -- озплюєма територія
//     members_amount integer, -- кількість учсаників формування
//     arbitrages json -- відомості про третейських суддів
// );

// create table documents (
//     id uuid not null primary key, -- унікальний ідентифікатор документа
//     pf_id uuid not null references pub_formations(id), -- індентифікатор ГФ до якого відноситься цей документ
//     type text not null, -- тип документу
//     name text not null, -- назва документу
//     uri text not null -- посилання на ресурс для завантаження документу
// );

// create table pf_transaction_log (
//     id uuid not null primary key, -- унікальний ідентифікатор транзакції
//     pf_id uuid not null references pub_formations(id), -- ідентифікатор ГФ до якого транзакція застосована
//     initiator_id uuid not null references users(id), -- ідентифікатор реєстратора який ініціював транзакцію
//     type text not null, -- тип транзакції (створення, видалення, редагування)
//     date date not null, -- дата виконання транзакції
//     old_value json, -- старе значення до транзакції
//     new_value json, -- нове значення після транзакції
//     col_name text -- назва колонки що була заторкнута
// );
