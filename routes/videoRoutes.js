const express = require('express');
const {
  getVideos,
  getStats,
  getLogs,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo
} = require('../controller/videoController');

const { protect, authorize } = require('../middleware/auth');
const { validateBody, validateParams } = require('../middleware/validation');
const { createVideoSchema, updateVideoSchema } = require('../validation/videoValidation');

const upload = require('../middleware/upload');

const router = express.Router();

// Apply protection to all video routes
router.use(protect);

router.get('/stats', getStats);
router.get('/logs', getLogs);

router
  .route('/')
  .get(getVideos)
  .post(authorize('Editor', 'Admin'), upload.single('video'), createVideo);

router.post('/upload', authorize('Editor', 'Admin'), upload.single('video'), createVideo);

router
  .route('/:id')
  .get(getVideo)
  .put(authorize('Editor', 'Admin'), validateBody(updateVideoSchema), updateVideo)
  .delete(authorize('Editor', 'Admin'), deleteVideo);

module.exports = router;
