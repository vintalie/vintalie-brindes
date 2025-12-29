import EligibleService from "./eligible.service";
import { tiendanubeApiClient } from "@config";

class WebhookHandler {
  static async handleOrderCreated(storeId: number, payload: any) {
    // payload may contain order data. Extract customer
    const order = payload.order || payload;
    const customer = order?.customer;
    if (!customer) return null;

    const customer_id = String(customer.id ?? customer.customer_id ?? customer.email ?? '');
    const customer_email = customer.email ?? null;

    // Attempt to detect if this is the customer's first order by querying orders
    try {
      const orders = await tiendanubeApiClient.get(`${storeId}/orders?customer_id=${customer.id}`);
      const total = Array.isArray(orders) ? orders.length : (orders?.length ?? 0);
      // If total === 1, then it's the first order (the current one)
      if (total === 1) {
        await EligibleService.markEligible(storeId, customer_id, customer_email);
      }
    } catch (e) {
      // swallow errors — don't fail webhook
      // eslint-disable-next-line no-console
      console.warn('webhook.handler: unable to check orders', (e as any).message || e);
    }

    return null;
  }
}

export default WebhookHandler;
