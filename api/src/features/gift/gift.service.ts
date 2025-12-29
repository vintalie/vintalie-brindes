import GiftRepository from "@repository/GiftRepository";

class GiftService {
  async getByStore(user_id: number) {
    return await GiftRepository.findByUser(user_id);
  }

  async create(user_id: number, product_id: string, opts?: { active?: boolean; apply_on_first_order?: boolean }) {
    const record = {
      user_id,
      product_id,
      active: opts?.active ?? true,
      apply_on_first_order: opts?.apply_on_first_order ?? true,
    };
    return await GiftRepository.create(record as any);
  }

  async update(user_id: number, payload: Partial<any>) {
    return await GiftRepository.update(user_id, payload);
  }

  async remove(user_id: number) {
    return await GiftRepository.delete(user_id);
  }
}

export default new GiftService();
