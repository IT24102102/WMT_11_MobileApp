const Crop = require("../models/Crop");

// @desc    Register a new crop
// @route   POST /api/crops
// @access  Private (Farmer only)
const registerCrop = async (req, res, next) => {
    try {
        const {
            cropType,
            variety,
            landSize,
            plantingDate,
            expectedHarvest,
            location,
            soilType,
            assignedAsc,
            season
        } = req.body;

        if (!cropType || !variety || !landSize || !location || !soilType || !assignedAsc) {
            res.status(400);
            throw new Error("Please provide all required fields");
        }

        const size = parseFloat(landSize);
        if (isNaN(size) || size <= 0) {
            res.status(400);
            throw new Error("Land size must be a positive number");
        }

        const crop = await Crop.create({
            farmer: req.user._id,
            cropType,
            variety,
            landSize: size,
            plantingDate,
            expectedHarvest,
            location,
            soilType,
            assignedAsc,
            season: season || "N/A",
            landDocument: req.file ? req.file.path : null
        });

        res.status(201).json({
            message: "Crop registered successfully",
            crop
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all crops (Farmers see their own, Officers see their ASC)
// @route   GET /api/crops
// @access  Private
const getCrops = async (req, res, next) => {
    try {
        let query = {};

        if (req.user.role === "FARMER") {
            query.farmer = req.user._id;
        } else if (req.user.role === "CROP_OFFICER" || req.user.role === "ASC_OFFICER") {
            if (!req.user.assignedAsc) {
                res.status(400);
                throw new Error("Officer not assigned to any ASC");
            }
            query.assignedAsc = req.user.assignedAsc?._id || req.user.assignedAsc;

            // Handle Specialization Filtering
            const specializationMap = {
                "Paddy (වී)": "rice",
                "Vegetables (එළවළු)": "vegetables",
                "Fruits (පලතුරු)": "fruits",
                "Spices (කුළුබඩු)": "spices",
                "Tea (තේ)": "tea",
                "Coconut (පොල්)": "coconut",
                "Rubber (රබර්)": "rubber",
                "Coffee (කෝපි)": "coffee",
                "Export Crops (අපනයන බෝග)": "export",
                "Other": "other"
            };

            if (req.user.specialization && specializationMap[req.user.specialization]) {
                query.cropType = specializationMap[req.user.specialization];
            }
        }

        const crops = await Crop.find(query)
            .populate("farmer", "name email nic")
            .populate("assignedAsc", "name district");

        res.json(crops);
    } catch (error) {
        next(error);
    }
};

// @desc    Update crop registration status
// @route   PATCH /api/crops/:id/status
// @access  Private (Officer only)
const updateCropStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
            res.status(400);
            throw new Error("Invalid status update value");
        }

        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            res.status(404);
            throw new Error("Crop record not found");
        }

        const officerAscId = req.user.assignedAsc?._id || req.user.assignedAsc;
        if (!officerAscId || crop.assignedAsc.toString() !== officerAscId.toString()) {
            res.status(403);
            throw new Error("Unauthorized to access crops outside your assigned ASC");
        }

        crop.status = status;
        await crop.save();

        res.json({
            message: "Crop registration status updated successfully",
            crop
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerCrop,
    getCrops,
    updateCropStatus
};
