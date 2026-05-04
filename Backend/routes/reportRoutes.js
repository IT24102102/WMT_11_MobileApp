const express = require('express');
const router = express.Router();
const { 
    createReportRequest, 
    getAllRequests, 
    getMyAscRequests, 
    submitReport, 
    uploadPdfReport,
    deleteRequest 
} = require('../Controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config for PDF reports
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/reports/');
    },
    filename: function (req, file, cb) {
        cb(null, `report-${req.params.id}-${Date.now()}.pdf`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"), false);
        }
    }
});

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
router.post('/requests/:id/upload', authorize('ASC_OFFICER'), upload.single('reportPdf'), uploadPdfReport);

module.exports = router;
