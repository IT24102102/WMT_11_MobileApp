const Machinery = require("../models/Machinery");
const MachineryRequest = require("../models/MachineryRequest");
const ServiceRequest = require("../models/ServiceRequest");
const FarmerMachinery = require("../models/FarmerMachinery");

// @desc    Get all available machinery in ASC
// @route   GET /api/machinery/available
const getAvailableMachinery = async (req, res, next) => {
    try {
        const ascId = req.user.assignedAsc?._id || req.user.assignedAsc;
        if (!ascId) {
            res.status(400);
            throw new Error("No ASC assigned to user");
        }

        const machinery = await Machinery.find({ asc: ascId, status: "Available" });
        res.json(machinery);
    } catch (error) {
        next(error);
    }
};

// @desc    Request machinery from ASC
// @route   POST /api/machinery/requests
const requestMachinery = async (req, res, next) => {
    try {
        const { machineryId, requestDate, duration, location, landSize, additionalNotes } = req.body;
        const ascId = req.user.assignedAsc?._id || req.user.assignedAsc;

        const machineryRequest = await MachineryRequest.create({
            farmer: req.user._id,
            machinery: machineryId,
            requestDate,
            duration,
            location,
            landSize,
            asc: ascId,
            additionalNotes
        });

        res.status(201).json({ message: "Machinery request submitted successfully!", machineryRequest });
    } catch (error) {
        next(error);
    }
};

// @desc    Request agricultural service
// @route   POST /api/machinery/services
const requestService = async (req, res, next) => {
    try {
        const { serviceType, requestDate, location, description } = req.body;
        const ascId = req.user.assignedAsc?._id || req.user.assignedAsc;

        const serviceRequest = await ServiceRequest.create({
            farmer: req.user._id,
            serviceType,
            requestDate,
            location,
            description,
            asc: ascId
        });

        res.status(201).json({ message: "Service request submitted successfully!", serviceRequest });
    } catch (error) {
        next(error);
    }
};

// @desc    Rent out personal machinery (Farmer) - CREATE
// @route   POST /api/machinery/rent-out
const rentOutMachinery = async (req, res, next) => {
    try {
        const { machineryType, description, rentPerDay, contactNumber, image } = req.body;
        const ascId = req.user.assignedAsc?._id || req.user.assignedAsc;

        const rental = await FarmerMachinery.create({
            farmer: req.user._id,
            machineryType,
            description,
            rentPerDay,
            contactNumber,
            asc: ascId,
            image
        });

        res.status(201).json({ message: "Machinery listed for rent successfully!", rental });
    } catch (error) {
        next(error);
    }
};

// @desc    Update farmer's own machinery listing - UPDATE
// @route   PUT /api/machinery/rent-out/:id
const updateFarmerMachinery = async (req, res, next) => {
    try {
        const { machineryType, description, rentPerDay, contactNumber, image, status } = req.body;
        const rental = await FarmerMachinery.findById(req.params.id);

        if (!rental) {
            res.status(404);
            throw new Error("Machinery listing not found");
        }

        // Check ownership
        if (rental.farmer.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("User not authorized to update this listing");
        }

        rental.machineryType = machineryType || rental.machineryType;
        rental.description = description || rental.description;
        rental.rentPerDay = rentPerDay || rental.rentPerDay;
        rental.contactNumber = contactNumber || rental.contactNumber;
        rental.image = image || rental.image;
        rental.status = status || rental.status;

        const updatedRental = await rental.save();
        res.json(updatedRental);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete farmer's own machinery listing - DELETE
// @route   DELETE /api/machinery/rent-out/:id
const deleteFarmerMachinery = async (req, res, next) => {
    try {
        const rental = await FarmerMachinery.findById(req.params.id);

        if (!rental) {
            res.status(404);
            throw new Error("Machinery listing not found");
        }

        // Check ownership
        if (rental.farmer.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("User not authorized to delete this listing");
        }

        await rental.deleteOne();
        res.json({ message: "Machinery listing removed successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Get farmer's own history (Requests and Listings) - READ
// @route   GET /api/machinery/my-history
const getMyHistory = async (req, res, next) => {
    try {
        const [machineryRequests, serviceRequests, myRentals] = await Promise.all([
            MachineryRequest.find({ farmer: req.user._id }).populate("machinery", "name type"),
            ServiceRequest.find({ farmer: req.user._id }),
            FarmerMachinery.find({ farmer: req.user._id })
        ]);

        res.json({ machineryRequests, serviceRequests, myRentals });
    } catch (error) {
        next(error);
    }
};

// @desc    Get community rentals in farmer's ASC area (excluding their own) - READ
// @route   GET /api/machinery/community-rentals
const getCommunityRentals = async (req, res, next) => {
    try {
        const ascId = req.user.assignedAsc?._id || req.user.assignedAsc;
        if (!ascId) {
            res.status(400);
            throw new Error("Please select an ASC center in your profile first");
        }

        const rentals = await FarmerMachinery.find({
            asc: ascId,
            status: "Available",
            farmer: { $ne: req.user._id }
        }).populate("farmer", "name email");

        res.json(rentals);
    } catch (error) {
        next(error);
    }
};

// --- Officer Logic ---

// @desc    Get all regional requests and rentals (Machinery Officer)
const getRegionalData = async (req, res, next) => {
    try {
        const ascId = req.user.assignedAsc?._id || req.user.assignedAsc;
        if (!ascId) {
            res.status(400);
            throw new Error("No ASC assigned to officer");
        }

        const [machineryRequests, serviceRequests, farmerRentals, inventory] = await Promise.all([
            MachineryRequest.find({ asc: ascId }).populate("farmer", "name email nic").populate("machinery", "name type"),
            ServiceRequest.find({ asc: ascId }).populate("farmer", "name email nic"),
            FarmerMachinery.find({ asc: ascId }).populate("farmer", "name email nic"),
            Machinery.find({ asc: ascId })
        ]);

        res.json({ machineryRequests, serviceRequests, farmerRentals, inventory });
    } catch (error) {
        next(error);
    }
};

// @desc    Update machinery request status
const updateMachineryRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const request = await MachineryRequest.findById(req.params.id);
        if (!request) {
            res.status(404);
            throw new Error("Request not found");
        }

        request.status = status;
        await request.save();

        res.json({ message: "Request status updated!", request });
    } catch (error) {
        next(error);
    }
};

// @desc    Update service request status
const updateServiceRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const request = await ServiceRequest.findById(req.params.id);
        if (!request) {
            res.status(404);
            throw new Error("Request not found");
        }

        request.status = status;
        await request.save();

        res.json({ message: "Service request updated!", request });
    } catch (error) {
        next(error);
    }
};

// @desc    Manage ASC machinery inventory
const addInventoryItem = async (req, res, next) => {
    try {
        const { name, type, totalCount } = req.body;
        const ascId = req.user.assignedAsc?._id || req.user.assignedAsc;

        const item = await Machinery.create({
            name,
            type,
            totalCount,
            availableCount: totalCount,
            asc: ascId
        });

        res.status(201).json({ message: "Machinery added to inventory!", item });
    } catch (error) {
        next(error);
    }
};

// @desc    Update machinery inventory item (available count)
const updateInventoryItem = async (req, res, next) => {
    try {
        const { availableCount } = req.body;
        const item = await Machinery.findById(req.params.id);
        if (!item) {
            res.status(404);
            throw new Error("Inventory item not found");
        }

        if (availableCount !== undefined) item.availableCount = availableCount;
        await item.save();
        res.json({ message: "Inventory updated successfully", item });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete machinery inventory item
const deleteInventoryItem = async (req, res, next) => {
    try {
        const item = await Machinery.findById(req.params.id);
        if (!item) {
            res.status(404);
            throw new Error("Inventory item not found");
        }
        await item.deleteOne();
        res.json({ message: "Inventory item removed successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailableMachinery,
    requestMachinery,
    requestService,
    rentOutMachinery,
    updateFarmerMachinery,
    deleteFarmerMachinery,
    getMyHistory,
    getCommunityRentals,
    getRegionalData,
    updateMachineryRequestStatus,
    updateServiceRequestStatus,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};
