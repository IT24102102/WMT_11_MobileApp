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
    deadline: {
        type: Date,
        required: [true, 'Please set a deadline']
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
    }
}, { timestamps: true });

module.exports = mongoose.model('ReportRequest', reportRequestSchema);
