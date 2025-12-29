import { NextFunction, Request, Response } from "express";
import { StatusCode } from "@utils";
import GiftService from "./gift.service";

class GiftController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = +req.user.user_id;
      const data = await GiftService.getByStore(user_id);
      return res.status(StatusCode.OK).json(data || {});
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = +req.user.user_id;
      const { product_id, active, apply_on_first_order } = req.body;
      const data = await GiftService.create(user_id, product_id, { active, apply_on_first_order });
      return res.status(StatusCode.CREATED).json(data);
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = +req.user.user_id;
      const payload = req.body;
      const data = await GiftService.update(user_id, payload);
      return res.status(StatusCode.OK).json(data);
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = +req.user.user_id;
      const ok = await GiftService.remove(user_id);
      return res.status(StatusCode.OK).json({ success: ok });
    } catch (e) {
      next(e);
    }
  }
}

export default new GiftController();
