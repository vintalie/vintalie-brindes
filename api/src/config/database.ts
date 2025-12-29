import type { Knex } from "knex";

let knex: Knex | null = null;

if (process.env.DB_TYPE === "mysql") {
  // dynamic require to avoid hard runtime dependency when not using MySQL
  // Install with: `yarn add knex mysql2` in the `api/` folder
  // Environment variables required: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
  // Example: DB_TYPE=mysql DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD=pass DB_NAME=app_db
  // knex is only initialized when DB_TYPE === 'mysql'
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Knex = require("knex");

  knex = Knex({
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "app_db",
    },
    pool: { min: 0, max: 7 },
  });

  // ensure credentials table exists (best-effort; non-blocking)
  (async () => {
    try {
      const exists = await knex!.schema.hasTable("credentials");
      if (!exists) {
        await knex!.schema.createTable("credentials", (table: any) => {
          table.integer("user_id").primary();
          table.text("access_token");
          table.string("token_type");
          table.string("scope");
          table.string("error");
          table.text("error_description");
          table.timestamp("created_at").defaultTo(knex!.fn.now());
        });
      }
      // ensure gifts table exists
      const giftsExists = await knex!.schema.hasTable("gifts");
      if (!giftsExists) {
        await knex!.schema.createTable("gifts", (table: any) => {
          table.increments("id").primary();
          table.integer("user_id").notNullable().index();
          table.string("product_id").notNullable();
          table.boolean("active").defaultTo(true);
          table.boolean("apply_on_first_order").defaultTo(true);
          table.timestamp("created_at").defaultTo(knex!.fn.now());
          table.timestamp("updated_at").nullable();
        });
      }
      // ensure eligible_customers table exists
      const eligibleExists = await knex!.schema.hasTable("eligible_customers");
      if (!eligibleExists) {
        await knex!.schema.createTable("eligible_customers", (table: any) => {
          table.increments("id").primary();
          table.integer("user_id").notNullable().index();
          table.string("customer_id").notNullable().index();
          table.string("customer_email").nullable();
          table.integer("gift_id").nullable();
          table.boolean("applied").defaultTo(false);
          table.timestamp("created_at").defaultTo(knex!.fn.now());
        });
      }
    } catch (e) {
        // non-fatal: log and continue
        // eslint-disable-next-line no-console
        console.warn("database: could not ensure credentials table:", (e as any).message || e);
      }
  })();
}

export const getKnex = (): Knex | null => knex;

export default {
  getKnex,
};
