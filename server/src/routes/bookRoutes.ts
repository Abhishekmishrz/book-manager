import { Router } from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  updateStatus,
  toggleFavourite,
} from '../controllers/bookController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/').get(getBooks).post(createBook);
router.route('/:id').get(getBook).patch(updateBook).delete(deleteBook);
router.patch('/:id/status', updateStatus);
router.patch('/:id/favourite', toggleFavourite);

export default router;
