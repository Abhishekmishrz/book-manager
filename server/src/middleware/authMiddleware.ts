import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  const user = await User.findById(decoded.id).select('+password');

  if (!user) {
    res.status(401).json({ success: false, message: 'User no longer exists' });
    return;
  }

  req.user = user;
  next();
};
