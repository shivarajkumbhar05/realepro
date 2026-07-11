const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  updateUser,
  deleteUser,
  getPendingProperties,
  createUser,
  getUserDetail,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes: must be logged in AND be admin
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/pending-properties', getPendingProperties);

module.exports = router;
