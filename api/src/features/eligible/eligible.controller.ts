import { NextFunction, Request, Response } from "express";
import { StatusCode } from "@utils";
import EligibleService from "./eligible.service";

class EligibleController {
  async getEligible(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = +req.user.user_id;
      const { customer_id } = req.query as any;
      if (!customer_id) return res.status(StatusCode.BAD_REQUEST).json({ message: 'customer_id required' });
      const gift = await EligibleService.getEligibleGift(user_id, String(customer_id));
      return res.status(StatusCode.OK).json(gift || {});
    } catch (e) {
      next(e);
    }
  }

  async markApplied(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = +req.user.user_id;
      const { customer_id } = req.body as any;
      if (!customer_id) return res.status(StatusCode.BAD_REQUEST).json({ message: 'customer_id required' });
      await EligibleService.markApplied(user_id, String(customer_id));
      return res.status(StatusCode.OK).json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
}

export default new EligibleController();
