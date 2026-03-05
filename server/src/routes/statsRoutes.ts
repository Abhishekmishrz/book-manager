import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getOverview, getMonthlyStats, getGenreStats, getAuthorStats, getStreakData } from '../services/statsService';

const router = Router();

router.use(protect);

router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getOverview(req.user!._id.toString());
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/monthly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getMonthlyStats(req.user!._id.toString());
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/genres', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getGenreStats(req.user!._id.toString());
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/authors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAuthorStats(req.user!._id.toString());
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/streak', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getStreakData(req.user!._id.toString());
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
