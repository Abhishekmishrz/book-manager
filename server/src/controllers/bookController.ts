import { Request, Response, NextFunction } from 'express';
import { SortOrder } from 'mongoose';
import Book from '../models/Book';

export const getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { status, genre, search, sort = 'newest', favourite, page = '1', limit = '20' } = req.query;

    const filter: Record<string, unknown> = { user: userId };
    if (status) filter.status = status;
    if (genre) filter.genre = new RegExp(genre as string, 'i');
    if (favourite === 'true') filter.favourite = true;
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { author: new RegExp(search as string, 'i') },
      ];
    }

    const sortMap: Record<string, Record<string, SortOrder>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title: { title: 1 },
      author: { author: 1 },
      rating: { rating: -1 },
    };
    const sortQuery = sortMap[sort as string] || sortMap.newest;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(filter).sort(sortQuery).skip(skip).limit(limitNum),
      Book.countDocuments(filter),
    ]);

    res.json({
      success: true,
      books,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const getBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user!._id });
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

const applyStatusDates = (data: Record<string, unknown>): Record<string, unknown> => {
  if (data.status === 'reading' && !data.startedAt) data.startedAt = new Date();
  if (data.status === 'completed' && !data.finishedAt) data.finishedAt = new Date();
  return data;
};

export const createBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = applyStatusDates({ ...req.body });
    const book = await Book.create({ ...data, user: req.user!._id });
    res.status(201).json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Book.findOne({ _id: req.params.id, user: req.user!._id });
    const data = applyStatusDates({ ...req.body, finishedAt: req.body.finishedAt ?? existing?.finishedAt, startedAt: req.body.startedAt ?? existing?.startedAt });
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      data,
      { new: true, runValidators: true }
    );
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    res.json({ success: true, message: 'Book removed' });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const update: Record<string, unknown> = { status };

    if (status === 'reading') update.startedAt = new Date();
    if (status === 'completed') update.finishedAt = new Date();

    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      update,
      { new: true, runValidators: true }
    );
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

export const toggleFavourite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user!._id });
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    book.favourite = !book.favourite;
    await book.save();
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
};
