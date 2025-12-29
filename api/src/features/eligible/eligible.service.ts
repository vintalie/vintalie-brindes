import EligibleRepository from "@repository/EligibleRepository";
import GiftRepository from "@repository/GiftRepository";

class EligibleService {
  async markEligible(user_id: number, customer_id: string, customer_email?: string) {
    const existing = await EligibleRepository.find(user_id, customer_id);
    if (existing) return existing;
    const gift = await GiftRepository.findByUser(user_id as any);
    const payload = {
      user_id,
      customer_id,
      customer_email,
      gift_id: gift?.id ?? null,
      applied: false,
    };
    return await EligibleRepository.create(payload as any);
  }

  async getEligibleGift(user_id: number, customer_id: string) {
    const rec = await EligibleRepository.find(user_id, customer_id);
    if (!rec || rec.applied) return null;
    // return gift data
    if (!rec.gift_id) return null;
    // fetch gift
    const gift = await GiftRepository.findByUser(user_id as any);
    return gift;
  }

  async markApplied(user_id: number, customer_id: string) {
    return await EligibleRepository.markApplied(user_id, customer_id);
  }
}

export default new EligibleService();
