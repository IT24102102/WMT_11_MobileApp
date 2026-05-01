const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Crop Protection",
                "Crop Nutrients",
                "Seeds & Planting Material",
                "Agri Equipment",
                "Animal Health & Nutrition",
                "Post-Harvest & Storage",
                "Irrigation & Water Management",
                "Home & Garden",
                "Other"
            ],
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            required: true, // e.g., 'kg', 'ltr', 'item', 'pack'
        },
        districts: {
            type: [String],
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Changed to false to support legacy data with 'manager' field
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Legacy field name found in database
        },
        sellerRole: {
            type: String,
            enum: ["PRODUCT_MANAGER", "FARMER"],
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Active", "Out of Stock", "Discontinued", "Rejected"],
            default: "Active",
        },
        image: {
            type: String, // Base64 string
            default: null,
        },
        stock: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
