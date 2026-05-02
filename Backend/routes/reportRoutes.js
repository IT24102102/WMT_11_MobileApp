const express = require('express');
const router = express.Router();
const { 
    createReportRequest, 
    getAllRequests, 
    getMyAscRequests, 
    submitReport, 
    deleteRequest 
} = require('../Controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin Routes
router.route('/requests')
    .post(authorize('ADMIN'), createReportRequest)
    .get(authorize('ADMIN'), getAllRequests);

router.route('/requests/:id')
    .delete(authorize('ADMIN'), deleteRequest);

// ASC Officer Routes
router.get('/my-requests', authorize('ASC_OFFICER'), getMyAscRequests);
router.put('/requests/:id/submit', authorize('ASC_OFFICER'), submitReport);

module.exports = router;
