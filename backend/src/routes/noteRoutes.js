import { Router } from 'express';
import * as notes from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// sab note routes protected
router.use(protect);

// stats / trash / export (keep these before the :id routes)
router.get('/stats/dashboard', notes.dashboardStats);
router.get('/trash', notes.listTrash);
router.delete('/trash/empty', notes.emptyTrash);
router.get('/export/markdown', notes.exportAllMarkdown);

router.route('/').get(notes.listNotes).post(notes.createNote);

router
  .route('/:id')
  .get(notes.getNote)
  .put(notes.updateNote)
  .delete(notes.trashNote); // soft delete -> trash

router.patch('/:id/autosave', notes.autosaveNote);
router.patch('/:id/restore', notes.restoreNote);
router.delete('/:id/permanent', notes.deleteNotePermanently);

router.post('/:id/duplicate', notes.duplicateNote);
router.patch('/:id/pin', notes.togglePin);
router.patch('/:id/favorite', notes.toggleFavorite);
router.get('/:id/versions', notes.getVersions);
router.post('/:id/versions/:index/restore', notes.restoreVersion);

export default router;
