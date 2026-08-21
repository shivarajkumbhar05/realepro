const mongoose = require('mongoose');
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('purchase', 'status offerPrice')
      .populate('property', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID.' });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
