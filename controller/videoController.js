const { asyncHandler } = require('../middleware/errorHandler');
const videoService = require('../services/videoService');

/**
 * @desc    Get all videos
 * @route   GET /api/v1/videos
 * @access  Private
 */
const getVideos = asyncHandler(async (req, res, next) => {
  const videos = await videoService.findAllVideos(req.query, req.user.id, req.user.role, req.user.tenantId);
  
  res.status(200).json({
    success: true,
    count: videos.length,
    data: videos,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Get dashboard stats
 * @route   GET /api/v1/videos/stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res, next) => {
  const stats = await videoService.getDashboardStats(req.user.tenantId);
  
  res.status(200).json({
    success: true,
    data: stats,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Get video audit logs
 * @route   GET /api/v1/videos/logs
 * @access  Private
 */
const getLogs = asyncHandler(async (req, res, next) => {
  const logs = await videoService.getAuditLogs(req.user.tenantId);
  
  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Get single video
 * @route   GET /api/v1/videos/:id
 * @access  Private
 */
const getVideo = asyncHandler(async (req, res, next) => {
  const video = await videoService.findVideoById(req.params.id, req.user.id, req.user.role, req.user.tenantId);

  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    success: true,
    data: video,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Create new video (with local file upload)
 * @route   POST /api/v1/videos
 * @access  Private (Editor, Admin)
 */
const createVideo = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a video file',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  const io = req.app.get('io');
  const videoData = {
    title: title || req.file.originalname,
    description: description || '',
    url: `/uploads/${req.file.filename}`,
    duration: 0 
  };

  const video = await videoService.createVideo(videoData, req.user.id, req.user.name, req.user.tenantId, io);

  res.status(201).json({
    success: true,
    data: video,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Update video
 * @route   PUT /api/v1/videos/:id
 * @access  Private (Editor, Admin)
 */
const updateVideo = asyncHandler(async (req, res, next) => {
  const video = await videoService.updateVideo(req.params.id, req.body, req.user.id, req.user.name, req.user.role, req.user.tenantId);

  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    success: true,
    data: video,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Delete video
 * @route   DELETE /api/v1/videos/:id
 * @access  Private (Admin)
 */
const deleteVideo = asyncHandler(async (req, res, next) => {
  const result = await videoService.deleteVideo(req.params.id, req.user.id, req.user.name, req.user.role, req.user.tenantId);

  res.status(200).json({
    success: true,
    message: result.message,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getVideos,
  getStats,
  getLogs,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo
};
