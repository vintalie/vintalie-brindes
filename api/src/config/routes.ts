import { Router } from "express";
import passport from "passport";

import { AuthenticationController } from "@features/auth";
import { ProductController } from "@features/product";
import { GiftController } from "@features/gift";
import EligibleController from "@features/eligible/eligible.controller";

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

// Webhooks (public endpoint to receive order.created from Nuvemshop)
routes.post('/webhooks/order', express.json(), async (req, res) => {
  try {
    // Minimal handler delegates to feature service asynchronously
    const payload = req.body;
    // expect header 'x-store-id' with the user_id (store id)
    const storeId = Number(req.headers['x-store-id'] || req.query.store_id || 0);
    const { customer } = payload.order || payload;
    // lazy import to avoid cycle
    const { default: WebhookHandler } = await import('@features/eligible/webhook.handler');
    WebhookHandler.handleOrderCreated(storeId, payload)
      .then(() => res.status(200).json({ ok: true }))
      .catch((e) => res.status(200).json({ ok: false }));
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

export default routes;
