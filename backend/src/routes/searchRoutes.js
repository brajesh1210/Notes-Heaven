import { Router } from 'express';
import * as search from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', search.searchNotes);
router.get('/suggestions', search.suggestions);

export default router;
