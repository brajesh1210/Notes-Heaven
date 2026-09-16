import { Router } from 'express';
import * as tags from '../controllers/tagsController.js';
import { protect } from '../middleware/auth.js';
import { validate, body } from '../middleware/validator.js';

const router = Router();
router.use(protect);

router.route('/').get(tags.listTags).post(validate(body('name').required('Tag name daalo')), tags.createTag);
router.route('/:id').put(tags.updateTag).delete(tags.deleteTag);

export default router;
