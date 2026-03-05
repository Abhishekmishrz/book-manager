import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

const sendTokenCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id.toString());
    sendTokenCookie(res, token);

    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, readingGoal: user.readingGoal },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = signToken(user._id.toString());
    sendTokenCookie(res, token);

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, readingGoal: user.readingGoal, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.json({ success: true, message: 'Logged out' });
};

export const getMe = (req: Request, res: Response): void => {
  const user = req.user!;
  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, readingGoal: user.readingGoal, avatar: user.avatar },
  });
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, avatar, readingGoal, currentPassword, newPassword } = req.body;
    const user = req.user!;

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (readingGoal) user.readingGoal = readingGoal;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: 'Current password required to set new password' });
        return;
      }
      const valid = await user.comparePassword(currentPassword);
      if (!valid) {
        res.status(401).json({ success: false, message: 'Current password is incorrect' });
        return;
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, readingGoal: user.readingGoal, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.user!._id);
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0),
    });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
};
