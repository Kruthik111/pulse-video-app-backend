const fs = require('fs').promises;
const path = require('path');
const Video = require('../models/Video');
const AuditLog = require('../models/AuditLog');

/**
 * @desc Create an audit log entry
 */
const createAuditLog = async (logData) => {
  try {
    await AuditLog.create(logData);
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

/**
 * @desc Get all videos for a tenant
 */
const findAllVideos = async (query = {}, userId, role, tenantId) => {
  const filter = { tenantId };
  if (role === 'Viewer') {
    filter.status = 'Safe';
  }
  if (query.status) filter.status = query.status;
  if (query.title) filter.title = { $regex: query.title, $options: 'i' };

  return await Video.find(filter).sort('-createdAt');
};

/**
 * @desc Get dashboard stats for a tenant
 */
const getDashboardStats = async (tenantId) => {
  const totalVideos = await Video.countDocuments({ tenantId });
  const safeVideos = await Video.countDocuments({ tenantId, status: 'Safe' });
  const flaggedVideos = await Video.countDocuments({ tenantId, status: 'Flagged' });
  const processingVideos = await Video.countDocuments({ tenantId, status: 'Processing' });

  // Limit logic: 3 videos max
  const remainingSlots = Math.max(0, 3 - totalVideos);
  
  return {
    totalVideos,
    safeVideos,
    flaggedVideos,
    processingVideos,
    remainingSlots,
    limit: 3
  };
};

/**
 * @desc Get audit logs for a tenant
 */
const getAuditLogs = async (tenantId) => {
  return await AuditLog.find({ tenantId }).sort('-createdAt').limit(50);
};

/**
 * @desc Get single video by ID (with tenant isolation)
 */
const findVideoById = async (id, userId, role, tenantId) => {
  const video = await Video.findOne({ _id: id, tenantId });
  if (!video) return null;
  if (role === 'Viewer' && video.status === 'Flagged') return null;
  return video;
};

/**
 * @desc Create new video for a tenant with simulation
 */
const createVideo = async (videoData, userId, userName, tenantId, io) => {
  // 1. Check video count limit (3 per tenant)
  const videoCount = await Video.countDocuments({ tenantId });
  if (videoCount >= 3) {
    if (videoData.url) {
      const filePath = path.join(__dirname, '..', videoData.url);
      await fs.unlink(filePath).catch(() => {});
    }
    throw new Error('Video limit reached (max 3 per tenant). Please delete a video to upload a new one.');
  }

  // 2. Create video record with 'Processing' status
  const video = await Video.create({
    ...videoData,
    uploadedBy: userId,
    tenantId,
    status: 'Processing'
  });

  // 3. Create Audit Log
  await createAuditLog({
    userId,
    userName,
    tenantId,
    videoId: video._id,
    videoTitle: video.title,
    action: 'Upload',
    details: `Uploaded video: ${video.title}`
  });

  // 4. Start simulated "sensitivity processing"
  simulateProcessing(video, tenantId, io, userId, userName);

  return video;
};

/**
 * @desc Simulate background processing and emit socket updates
 */
const simulateProcessing = (video, tenantId, io, userId, userName) => {
  let progress = 0;
  const interval = setInterval(async () => {
    progress += Math.floor(Math.random() * 20) + 10;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      const finalStatus = Math.random() > 0.2 ? 'Safe' : 'Flagged';
      await Video.findByIdAndUpdate(video._id, { status: finalStatus });
      
      // Audit log for status change
      await createAuditLog({
        userId,
        userName: 'System (AI)',
        tenantId,
        videoId: video._id,
        videoTitle: video.title,
        action: 'Status Change',
        details: `AI analysis completed. Status set to: ${finalStatus}`
      });

      io.to(tenantId).emit('video_processing_complete', {
        videoId: video._id,
        status: finalStatus,
        title: video.title
      });
    } else {
      io.to(tenantId).emit('video_processing_progress', {
        videoId: video._id,
        progress,
        title: video.title
      });
    }
  }, 1500);
};

/**
 * @desc Update video
 */
const updateVideo = async (id, videoData, userId, userName, role, tenantId) => {
  const video = await Video.findOneAndUpdate(
    { _id: id, tenantId },
    videoData,
    { new: true, runValidators: true }
  );

  if (video) {
    await createAuditLog({
      userId,
      userName,
      tenantId,
      videoId: video._id,
      videoTitle: video.title,
      action: 'Update',
      details: `Updated video details: ${video.title}`
    });
  }

  return video;
};

/**
 * @desc Delete video (with physical file removal)
 */
const deleteVideo = async (id, userId, userName, role, tenantId) => {
  const video = await Video.findOne({ _id: id, tenantId });
  
  if (!video) {
    throw new Error('Video not found or you do not have permission');
  }

  if (video.url) {
    const filePath = path.join(__dirname, '..', video.url);
    await fs.unlink(filePath).catch(err => console.error(`Failed to delete file: ${filePath}`, err));
  }

  await createAuditLog({
    userId,
    userName,
    tenantId,
    videoId: video._id,
    videoTitle: video.title,
    action: 'Delete',
    details: `Successfully deleted video and physical file: ${video.title}`
  });

  await Video.findByIdAndDelete(id);

  return { success: true, message: "Video deleted successfully" };
};

module.exports = {
  findAllVideos,
  getDashboardStats,
  getAuditLogs,
  findVideoById,
  createVideo,
  updateVideo,
  deleteVideo
};
