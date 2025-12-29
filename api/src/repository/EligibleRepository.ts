import { getKnex } from "@config/database";
import path from "path";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

interface EligibleRecord {
  id?: number;
  user_id: number;
  customer_id: string;
  customer_email?: string | null;
  gift_id?: number | null;
  applied?: boolean;
  created_at?: string;
}

const knex = getKnex();

const adapter = new FileSync(path.resolve("db.json"));
const database = low(adapter);

class EligibleRepository {
  async create(record: EligibleRecord): Promise<EligibleRecord> {
    if (knex) {
      const [id] = await knex("eligible_customers").insert({
        user_id: record.user_id,
        customer_id: record.customer_id,
        customer_email: record.customer_email,
        gift_id: record.gift_id,
        applied: record.applied ?? false,
      });
      return { ...record, id };
    }

    const list = database.get("eligible_customers").value() ?? [];
    const nextId = (list?.reduce((m: number, r: any) => Math.max(m, r.id || 0), 0) || 0) + 1;
    const newRec = { ...record, id: nextId, created_at: new Date().toISOString() };
    list.push(newRec as any);
    database.set("eligible_customers", list).write();
    return newRec;
  }

  async find(user_id: number, customer_id: string): Promise<EligibleRecord | null> {
    if (knex) {
      const row = await knex("eligible_customers").where({ user_id, customer_id }).first();
      return row || null;
    }
    const list = database.get("eligible_customers").value() ?? [];
    return list.find((r: any) => Number(r.user_id) === Number(user_id) && String(r.customer_id) === String(customer_id)) || null;
  }

  async markApplied(user_id: number, customer_id: string): Promise<boolean> {
    if (knex) {
      const affected = await knex("eligible_customers").where({ user_id, customer_id }).update({ applied: true });
      return affected > 0;
    }
    const list = database.get("eligible_customers").value() ?? [];
    const idx = list.findIndex((r: any) => Number(r.user_id) === Number(user_id) && String(r.customer_id) === String(customer_id));
    if (idx === -1) return false;
    list[idx].applied = true;
    database.set("eligible_customers", list).write();
    return true;
  }
}

export default new EligibleRepository();
