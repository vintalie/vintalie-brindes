import EligibleService from "./eligible.service";
import { tiendanubeApiClient } from "@config";

class WebhookHandler {
  static async handleOrderCreated(storeId: number, payload: any) {
    const order = payload.order || payload;
    const customer = order?.customer;
    if (!customer) return null;

    const customer_id = String(customer.id ?? customer.customer_id ?? customer.email ?? "");
    const customer_email = customer.email ?? null;

    try {
      const orders = await tiendanubeApiClient.get(`${storeId}/orders?customer_id=${customer.id}`);
      const total = Array.isArray(orders) ? orders.length : orders?.length ?? 0;
      if (total === 1) {
        await EligibleService.markEligible(storeId, customer_id, customer_email);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("webhook.handler: unable to check orders", (e as any).message || e);
    }

    return null;
  }
}

export default WebhookHandler;
