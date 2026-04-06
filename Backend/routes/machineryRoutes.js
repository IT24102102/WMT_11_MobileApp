const express = require("express");
const router = express.Router();
const {
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
} = require("../Controllers/machineryController");
const { protect, authorize } = require("../middleware/authMiddleware");

// --- Farmer Routes ---

// @desc    Get all available machinery in ASC
// @route   GET /api/machinery/available
router.get("/available", protect, getAvailableMachinery);

// @desc    Request machinery from ASC
// @route   POST /api/machinery/requests
router.post("/requests", protect, authorize("FARMER"), requestMachinery);

// @desc    Request agricultural service
// @route   POST /api/machinery/services
router.post("/services", protect, authorize("FARMER"), requestService);

// @desc    Rent out personal machinery (Farmer) - CREATE
// @route   POST /api/machinery/rent-out
router.post("/rent-out", protect, authorize("FARMER"), rentOutMachinery);

// @desc    Update farmer's own machinery listing - UPDATE
// @route   PUT /api/machinery/rent-out/:id
router.put("/rent-out/:id", protect, authorize("FARMER"), updateFarmerMachinery);

// @desc    Delete farmer's own machinery listing - DELETE
// @route   DELETE /api/machinery/rent-out/:id
router.delete("/rent-out/:id", protect, authorize("FARMER"), deleteFarmerMachinery);

// @desc    Get farmer's own history (Requests and Listings) - READ
// @route   GET /api/machinery/my-history
router.get("/my-history", protect, authorize("FARMER"), getMyHistory);

// @desc    Get community rentals in farmer's ASC area (excluding their own) - READ
// @route   GET /api/machinery/community-rentals
router.get("/community-rentals", protect, authorize("FARMER"), getCommunityRentals);

// --- Officer Routes ---

// @desc    Get all regional requests and rentals (Machinery Officer)
// @route   GET /api/machinery/regional-data
router.get("/regional-data", protect, authorize("MACHINERY_OFFICER", "ASC_OFFICER"), getRegionalData);

// @desc    Update machinery request status
// @route   PATCH /api/machinery/requests/:id
router.patch("/requests/:id", protect, authorize("MACHINERY_OFFICER", "ASC_OFFICER"), updateMachineryRequestStatus);

// @desc    Update service request status
// @route   PATCH /api/machinery/services/:id
router.patch("/services/:id", protect, authorize("MACHINERY_OFFICER", "ASC_OFFICER"), updateServiceRequestStatus);

// @desc    Manage ASC machinery inventory
// @route   POST /api/machinery/inventory
router.post("/inventory", protect, authorize("MACHINERY_OFFICER", "ASC_OFFICER"), addInventoryItem);

// @desc    Update machinery inventory item (available count)
// @route   PATCH /api/machinery/inventory/:id
router.patch("/inventory/:id", protect, authorize("MACHINERY_OFFICER", "ASC_OFFICER"), updateInventoryItem);

// @desc    Delete machinery inventory item
// @route   DELETE /api/machinery/inventory/:id
router.delete("/inventory/:id", protect, authorize("MACHINERY_OFFICER", "ASC_OFFICER"), deleteInventoryItem);

module.exports = router;
