import { createConnection, Connection, Repository, Like } from "typeorm";
import { Document } from "./entities/document.entity";
import { PubFormation } from "./entities/pub-formation.entity";
import { User } from "./entities/user.entity";
import { Service } from "typedi";
import { DeepPartial, Required, NullableProps } from "ts-typedefs";
import { OrmUtilsService } from "./orm-utils.service";

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
        return await this.orm.delete(this.users, {id});
    }

    async deleteDocument(id: string): Promise<boolean> {
        return await this.orm.delete(this.users, {id});
    }
}
