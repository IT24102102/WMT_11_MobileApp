const mongoose = require('mongoose');

const reportRequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a report title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description of what is needed']
    },
    requiredMonth: {
        type: String,
        required: [true, 'Please specify the required month for the report']
    },
    requestedMetrics: {
        type: [String],
        default: []
    },
    deadline: {
        type: Date
    },
    targetAsc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ASC',
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Submitted', 'Reviewed'],
        default: 'Pending'
    },
    submissionData: {
        type: String, // ASC Officer will fill this with their report content
        default: ''
    },
    submittedAt: {
        type: Date
    },
    submissionPdf: {
        type: String, // Path to the uploaded PDF file
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('ReportRequest', reportRequestSchema);
