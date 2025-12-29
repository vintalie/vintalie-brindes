import jsonServer from "json-server";
import path from "path";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { TiendanubeAuthInterface } from "@features/auth";
import { HttpErrorException } from "@utils";
import { getKnex } from "@config/database";

/**
 * this repository is temporary, please use real database to production mode
 */

const userRepository = jsonServer.router(path.resolve("db.json"));

const server = jsonServer.create();
const middleware = jsonServer.defaults();

server.use(middleware);
server.use(userRepository);

interface IDatabase {
  credentials: TiendanubeAuthInterface[];
}

const adapter = new FileSync<IDatabase>(path.resolve("db.json"));
const database = low(adapter);

const knex = getKnex();

class UserRepository {
  async save(credential: TiendanubeAuthInterface) {
    if (knex) {
      // upsert using knex (MySQL)
      try {
        await knex("credentials")
          .insert({
            user_id: credential.user_id,
            access_token: credential.access_token,
            token_type: credential.token_type,
            scope: credential.scope,
            error: credential.error,
            error_description: credential.error_description,
          })
          .onConflict("user_id")
          .merge();
        return;
      } catch (e) {
        // fallback to file
        // eslint-disable-next-line no-console
          console.warn("UserRepository.save: mysql error, falling back to file", (e as any).message || e);
      }
    }

    this.createOrUpdate(credential);
  }

  async findOne(user_id: number) {
    if (knex) {
      try {
        const row = await knex("credentials").where({ user_id: Number(user_id) }).first();
        if (!row) {
          throw new HttpErrorException("Read our documentation on how to authenticate your app").setStatusCode(404);
        }

        const result: TiendanubeAuthInterface = {
          access_token: row.access_token,
          token_type: row.token_type,
          scope: row.scope,
          user_id: Number(row.user_id),
          error: row.error,
          error_description: row.error_description,
        };
        return result;
      } catch (e) {
        if (e instanceof HttpErrorException) throw e;
        // fallback to file-based repository
        // eslint-disable-next-line no-console
        console.warn("UserRepository.findOne: mysql read error, falling back to file", (e as any).message || e);
      }
    }

    const credentials = database.get("credentials").value();
    const store = this.findValueFromProperty<TiendanubeAuthInterface, number>(
      "user_id",
      credentials,
      user_id
    );

    if (!store) {
      throw new HttpErrorException(
        "Read our documentation on how to authenticate your app"
      ).setStatusCode(404);
    }

    return store;
  }

  async listAll(): Promise<TiendanubeAuthInterface[]> {
    if (knex) {
      try {
        const rows = await knex('credentials').select();
        return rows.map((row: any) => ({
          access_token: row.access_token,
          token_type: row.token_type,
          scope: row.scope,
          user_id: Number(row.user_id),
          error: row.error,
          error_description: row.error_description,
        }));
      } catch (e) {
        // fallback to file
        // eslint-disable-next-line no-console
        console.warn('UserRepository.listAll: mysql read error, falling back to file', (e as any).message || e);
      }
    }

    const credentials = database.get('credentials').value() ?? [];
    return credentials as TiendanubeAuthInterface[];
  }

  findFirst(): TiendanubeAuthInterface {
    // For simplicity keep synchronous behaviour for findFirst using file DB
    return database.get("credentials").value()?.[0];
  }

  private createOrUpdate(data: TiendanubeAuthInterface) {
    const credentials = database.get("credentials").value() ?? [];
    const hasCredentials = this.findValueFromProperty<TiendanubeAuthInterface>(
      "user_id",
      credentials,
      data.user_id
    );

    if (hasCredentials) {
      const index = credentials.findIndex(
        (credential) => credential.user_id === data.user_id
      );
      credentials.splice(index, 1, data);
    } else {
      credentials?.push(data);
    }
    database.set("credentials", credentials).write();
  }

  private findValueFromProperty<T, K = any>(
    property: string,
    list: T[],
    value: K
  ): T | undefined {
    const findValue = list?.find(
      (values) => (values as any)[property] === Number(value)
    );
    return findValue;
  }
}

export default new UserRepository();
