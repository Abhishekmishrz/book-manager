import mongoose from 'mongoose';
import Book from '../models/Book';

export const getOverview = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);

  const [statusCounts, ratingAgg, pagesAgg] = await Promise.all([
    Book.aggregate([
      { $match: { user: uid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Book.aggregate([
      { $match: { user: uid, rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Book.aggregate([
      { $match: { user: uid, pages: { $exists: true }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pages' } } },
    ]),
  ]);

  const statsByStatus: Record<string, number> = {};
  statusCounts.forEach((s: { _id: string; count: number }) => {
    statsByStatus[s._id] = s.count;
  });

  return {
    total: Object.values(statsByStatus).reduce((a, b) => a + b, 0),
    byStatus: statsByStatus,
    averageRating: ratingAgg[0]?.avg ? Math.round(ratingAgg[0].avg * 10) / 10 : 0,
    pagesRead: pagesAgg[0]?.total || 0,
  };
};

export const getMonthlyStats = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const year = new Date().getFullYear();

  const results = await Book.aggregate([
    // Use finishedAt if set, otherwise fall back to updatedAt
    {
      $addFields: {
        completedDate: { $ifNull: ['$finishedAt', '$updatedAt'] },
      },
    },
    {
      $match: {
        user: uid,
        status: 'completed',
        completedDate: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$completedDate' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: 0,
  }));

  results.forEach((r: { _id: number; count: number }) => {
    months[r._id - 1].count = r.count;
  });

  return months;
};

export const getGenreStats = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);

  const results = await Book.aggregate([
    { $match: { user: uid, genre: { $exists: true, $ne: '' } } },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const total = results.reduce((sum: number, r: { count: number }) => sum + r.count, 0);
  return results.map((r: { _id: string; count: number }) => ({
    genre: r._id,
    count: r.count,
    percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
  }));
};

export const getAuthorStats = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);

  return Book.aggregate([
    { $match: { user: uid } },
    {
      $group: {
        _id: '$author',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        genres: { $addToSet: '$genre' },
        titles: { $push: '$title' },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        author: '$_id',
        count: 1,
        avgRating: { $round: ['$avgRating', 1] },
        genres: 1,
        titles: 1,
        completed: 1,
      },
    },
  ]);
};

export const getStreakData = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const results = await Book.aggregate([
    {
      $addFields: {
        completedDate: { $ifNull: ['$finishedAt', '$updatedAt'] },
      },
    },
    {
      $match: {
        user: uid,
        status: 'completed',
        completedDate: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedDate' },
          week: { $isoWeek: '$completedDate' },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return results.map((r: { _id: { year: number; week: number }; count: number }) => ({
    year: r._id.year,
    week: r._id.week,
    count: r.count,
  }));
};
