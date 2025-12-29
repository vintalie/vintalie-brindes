import { getKnex } from "@config/database";
import path from "path";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

interface GiftRecord {
  id?: number;
  user_id: number;
  product_id: string;
  active?: boolean;
  apply_on_first_order?: boolean;
  created_at?: string;
  updated_at?: string | null;
}

const knex = getKnex();

const adapter = new FileSync(path.resolve("db.json"));
const database = low(adapter);

class GiftRepository {
  async create(record: GiftRecord): Promise<GiftRecord> {
    if (knex) {
      const [id] = await knex("gifts").insert({
        user_id: record.user_id,
        product_id: record.product_id,
        active: record.active ?? true,
        apply_on_first_order: record.apply_on_first_order ?? true,
      });
      return { ...record, id };
    }

    const gifts = database.get("gifts").value() ?? [];
    const nextId = (gifts?.reduce((m: number, g: any) => Math.max(m, g.id || 0), 0) || 0) + 1;
    const newRec = { ...record, id: nextId, created_at: new Date().toISOString() };
    gifts.push(newRec as any);
    database.set("gifts", gifts).write();
    return newRec;
  }

  async findByUser(user_id: number): Promise<GiftRecord | null> {
    if (knex) {
      const row = await knex("gifts").where({ user_id }).first();
      return row || null;
    }
    const gifts = database.get("gifts").value() ?? [];
    const found = gifts.find((g: any) => Number(g.user_id) === Number(user_id));
    return found ?? null;
  }

  async update(user_id: number, payload: Partial<GiftRecord>): Promise<GiftRecord | null> {
    if (knex) {
      const row = await knex("gifts").where({ user_id }).first();
      if (!row) return null;
      await knex("gifts").where({ user_id }).update({ ...payload, updated_at: knex.fn.now() });
      return { ...row, ...payload };
    }
    const gifts = database.get("gifts").value() ?? [];
    const index = gifts.findIndex((g: any) => Number(g.user_id) === Number(user_id));
    if (index === -1) return null;
    const updated = { ...gifts[index], ...payload, updated_at: new Date().toISOString() };
    gifts.splice(index, 1, updated as any);
    database.set("gifts", gifts).write();
    return updated;
  }

  async delete(user_id: number): Promise<boolean> {
    if (knex) {
      const affected = await knex("gifts").where({ user_id }).del();
      return affected > 0;
    }
    const gifts = database.get("gifts").value() ?? [];
    const remaining = gifts.filter((g: any) => Number(g.user_id) !== Number(user_id));
    database.set("gifts", remaining).write();
    return true;
  }
}

export default new GiftRepository();
