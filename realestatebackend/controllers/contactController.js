const Contact = require('../models/Contact');
const User = require('../models/User');
const Property = require('../models/Property');

// ─── @route  POST /api/contact ──────────────────────────────────────────────
// ─── @access Public
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, propertyId } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      property: propertyId || null,
      status: 'new',
      isRead: false,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      data: contact,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message.',
    });
  }
};

// ─── @route  GET /api/contact ────────────────────────────────────────────────
// ─── @access Private (Admin only)
exports.getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, isRead, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [messages, total] = await Promise.all([
      Contact.find(query)
        .populate('property', 'title images price')
        .populate('assignedTo', 'name email')
        .populate('repliedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Contact.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: messages,
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── @route  GET /api/contact/:id ────────────────────────────────────────────
// ─── @access Private (Admin only)
exports.getContactMessage = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('property', 'title images price location')
      .populate('assignedTo', 'name email role')
      .populate('repliedBy', 'name email role');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    if (!contact.isRead) {
      contact.isRead = true;
      contact.readAt = Date.now();
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── @route  PUT /api/contact/:id/read ──────────────────────────────────────
// ─── @access Private (Admin only)
exports.markAsRead = async (req, res) => {
  try {
    const { isRead } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        isRead: isRead !== undefined ? isRead : true,
        readAt: isRead !== false ? Date.now() : null,
        status: isRead !== false ? 'read' : 'new',
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message status updated',
      data: contact,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── @route  POST /api/contact/:id/reply ────────────────────────────────────
// ─── @access Private (Admin only)
exports.replyToContact = async (req, res) => {
  try {
    const { reply, replySubject } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required.',
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    contact.reply = reply;
    contact.replySubject = replySubject || `Re: ${contact.subject}`;
    contact.repliedAt = Date.now();
    contact.repliedBy = req.user.id;
    contact.status = 'replied';
    await contact.save();

    const updatedContact = await Contact.findById(req.params.id)
      .populate('repliedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully.',
      data: updatedContact,
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── @route  PUT /api/contact/:id/status ────────────────────────────────────
// ─── @access Private (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'resolved', 'archived'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      data: contact,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── @route  DELETE /api/contact/:id ─────────────────────────────────────────
// ─── @access Private (Admin only)
exports.deleteContactMessage = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully.',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── @route  GET /api/contact/stats ─────────────────────────────────────────
// ─── @access Private (Admin only)
exports.getContactStats = async (req, res) => {
  try {
    const [total, newMessages, readMessages, repliedMessages, resolvedMessages, archivedMessages] =
      await Promise.all([
        Contact.countDocuments(),
        Contact.countDocuments({ status: 'new' }),
        Contact.countDocuments({ status: 'read' }),
        Contact.countDocuments({ status: 'replied' }),
        Contact.countDocuments({ status: 'resolved' }),
        Contact.countDocuments({ status: 'archived' }),
      ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const dailyMessages = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        newMessages,
        readMessages,
        repliedMessages,
        resolvedMessages,
        archivedMessages,
        last7Days,
        dailyMessages,
      },
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};