const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get faculty profile - Accessible by the faculty themselves or admin
router.get('/:id/profile', verifyToken, async (req, res, next) => {
  if (req.userId == req.params.id) {
    // Faculty is requesting their own profile
    return next();
  } else {
    // Check if user is an admin
    return isAdmin(req, res, next);
  }
}, facultyController.getFacultyProfile);

// Update faculty profile - Accessible by the faculty themselves or admin
// router.put('/:id/profile', verifyToken, async (req, res, next) => {
//   if (req.userId == req.params.id) {
//     // Faculty is updating their own profile
//     return next();
//   } else {
//     // Check if user is an admin
//     return isAdmin(req, res, next);
//   }
// }, facultyController.updateFacultyProfile);

module.exports = router;
