import Respond from '@/lib/respond';
import { Request, Response } from 'express';

class InitHandler {
  static async Get(req: Request, res: Response) {
    try {
      Respond(res, {
        message: 'Hello World',
      }, 200);
    } catch (error) {
      throw error;
    }
  }
  static async Post(req: Request, res: Response) {
    try {
      const { name } = req.body;
      Respond(res, {
        message: `Hello ${name}`,
      }, 200);
    } catch (error) {
      throw error;
    }
  }
  static async Put(req: Request, res: Response) {
    try {
      const { name } = req.body;
      Respond(res, {
        message: `Hello ${name}`,
      }, 200);
    } catch (error) {
      throw error;
    }
  }
  static async Delete(req: Request, res: Response) {
    try {
      const { name } = req.body;
      Respond(res, {
        message: `Hello ${name}`,
      }, 200);
    } catch (error) {
      throw error;
    }
  }
}

export default InitHandler;