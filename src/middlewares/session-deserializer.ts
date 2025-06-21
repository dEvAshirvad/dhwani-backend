import { Request, Response, NextFunction } from 'express';
import { auth } from '@/lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { Session, User } from 'better-auth';

const sessionDeserializer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    req.session = session?.session as Session;
    req.user = session?.user as User;
    next();
  } catch (error) {
    next(error);
  }
};

export default sessionDeserializer;
