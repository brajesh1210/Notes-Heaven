import { Router } from 'express';
import * as folders from '../controllers/folderController.js';
import { protect } from '../middleware/auth.js';
import { validate, body } from '../middleware/validator.js';

const router = Router();
router.use(protect);

router.route('/').get(folders.listFolders).post(validate(body('name').required('Folder name is required')), folders.createFolder);
router.route('/:id').get(folders.getFolder).put(folders.updateFolder).delete(folders.deleteFolder);
router.patch('/:id/favorite', folders.toggleFolderFavorite);

export default router;
