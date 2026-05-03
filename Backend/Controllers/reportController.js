const ReportRequest = require('../models/ReportRequest');
const ASC = require('../models/ASC');

// @desc    Create a report request (Admin)
// @route   POST /api/reports/requests
const createReportRequest = async (req, res, next) => {
    try {
        const { title, description, deadline, targetAsc, requiredMonth, requestedMetrics } = req.body;

        const request = await ReportRequest.create({
            title,
            description,
            deadline,
            targetAsc,
            requiredMonth,
            requestedMetrics,
            requestedBy: req.user._id
        });

        res.status(201).json(request);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all requests (Admin view)
// @route   GET /api/reports/requests
const getAllRequests = async (req, res, next) => {
    try {
        const requests = await ReportRequest.find()
            .populate('targetAsc', 'name district')
            .populate('requestedBy', 'name email');
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get requests for specific ASC (ASC Officer view)
// @route   GET /api/reports/my-requests
const getMyAscRequests = async (req, res, next) => {
    try {
        // ASC Officer's assigned center is in req.user.assignedAsc
        if (!req.user.assignedAsc) {
            return res.status(400).json({ message: "No ASC center assigned to your profile" });
        }

        const requests = await ReportRequest.find({ targetAsc: req.user.assignedAsc })
            .populate('requestedBy', 'name email');
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Submit report content (ASC Officer)
// @route   PUT /api/reports/requests/:id/submit
const submitReport = async (req, res, next) => {
    try {
        const { submissionData } = req.body;
        const request = await ReportRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.submissionData = submissionData;
        request.status = 'Submitted';
        request.submittedAt = Date.now();

        await request.save();
        res.json(request);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a request (Admin)
// @route   DELETE /api/reports/requests/:id
const deleteRequest = async (req, res, next) => {
    try {
        await ReportRequest.findByIdAndDelete(req.params.id);
        res.json({ message: "Request removed" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReportRequest,
    getAllRequests,
    getMyAscRequests,
    submitReport,
    deleteRequest
};
