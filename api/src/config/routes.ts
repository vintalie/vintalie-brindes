import { Router } from "express";
import express from "express";
import { verifyHmacHeader } from "@utils/webhook";
import passport from "passport";

import { AuthenticationController } from "@features/auth";
import { ProductController } from "@features/product";
import { GiftController } from "@features/gift";
import EligibleController from "@features/eligible/eligible.controller";
import UserRepository from "@repository/UserRepository";

const routes = Router();
routes.get("/auth/install", AuthenticationController.install);
routes.post(
  "/products",
  passport.authenticate("jwt", { session: false }),
  ProductController.create
);

routes.get(
  "/products/total",
  passport.authenticate("jwt", { session: false }),
  ProductController.getTotal
);

// Return installed stores (for the app) — useful to detect multiple installations
routes.get('/stores', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const list = await UserRepository.listAll();
    const cleaned = list.map((c: any) => ({ user_id: Number(c.user_id) }));
    return res.status(200).json({ count: cleaned.length, stores: cleaned });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('stores: error', (e as any).message || e);
    return res.status(500).json({ count: 0, stores: [] });
  }
});
routes.get(
  "/products",
  passport.authenticate("jwt", { session: false }),
  ProductController.getAll
);
routes.delete(
  "/products/:id",
  passport.authenticate("jwt", { session: false }),
  ProductController.delete
);

// Gift endpoints: manage store's gift product
routes.get(
  "/gift",
  passport.authenticate("jwt", { session: false }),
  GiftController.get
);

routes.post(
  "/gift",
  passport.authenticate("jwt", { session: false }),
  GiftController.create
);

routes.put(
  "/gift",
  passport.authenticate("jwt", { session: false }),
  GiftController.update
);

routes.delete(
  "/gift",
  passport.authenticate("jwt", { session: false }),
  GiftController.delete
);

// Eligible: check if a customer is eligible for the gift
routes.get(
  "/gift/eligible",
  passport.authenticate("jwt", { session: false }),
  EligibleController.getEligible
);

routes.post(
  "/gift/eligible/apply",
  passport.authenticate("jwt", { session: false }),
  EligibleController.markApplied
);

// Webhooks (public endpoint to receive order.created from Nuvemshop)
routes.post('/webhooks/order', express.json({ verify: (req: any, _res, buf: Buffer) => { req.rawBody = buf; } }), async (req, res) => {
  try {
    const payload = req.body;
    // accept several header names for compatibility
    const storeId = Number(req.headers['x-store-id'] || req.headers['x-shop-id'] || req.query.store_id || 0);
    if (!storeId || Number.isNaN(storeId)) {
      return res.status(400).json({ ok: false, error: 'missing_store_id' });
    }

    // If WEBHOOK_SECRET is configured, verify HMAC signature
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const sigHeader = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'] || req.headers['x-signature'] || req.headers['x-tiendanube-signature'];
      const raw = (req as any).rawBody || Buffer.from(JSON.stringify(payload || {}));
      const ok = verifyHmacHeader(String(secret), raw, sigHeader as any);
      if (!ok) {
        // eslint-disable-next-line no-console
        console.warn('webhooks/order: invalid signature', sigHeader);
        return res.status(401).json({ ok: false, error: 'invalid_signature' });
      }
    }

    // lazy import to avoid cycles and to keep startup fast
    const mod: any = await import("../features/eligible/webhookHandler.js");
    const WebhookHandler = mod.default;

    try {
      await WebhookHandler.handleOrderCreated(storeId, payload);
      return res.status(200).json({ ok: true });
    } catch (e) {
      // don't fail delivery; log and return 200 to acknowledge when appropriate
      // eslint-disable-next-line no-console
      console.warn('webhooks/order: handler error', (e as any).message || e);
      return res.status(200).json({ ok: false, error: 'handler_error' });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('webhooks/order: unexpected error', (e as any).message || e);
    return res.status(500).json({ ok: false });
  }
});

export default routes;
