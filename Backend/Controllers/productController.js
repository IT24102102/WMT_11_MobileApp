const Product = require("../models/Product");

// @desc    Get products available in user's region (Farmer/Public)
// @route   GET /api/products/available
const getAvailableProducts = async (req, res, next) => {
    try {
        const user = req.user;
        let query = { status: "Active" };

        if (user.role === 'FARMER') {
            let district = user.assignedAsc?.district;

            // Debugging: If population failed in middleware, try to re-populate
            if (!district && user.assignedAsc) {
                const User = require("../models/User");
                const populatedUser = await User.findById(user._id).populate('assignedAsc');
                district = populatedUser.assignedAsc?.district;
            }

                // FIXED DISTRICT QUERY:
                // Use a direct regex for case-insensitive matching on the districts array
                query = {
                    ...query,
                    $or: [
                        { sellerRole: 'PRODUCT_MANAGER' },
                        { sellerRole: { $exists: false } }
                    ],
                    districts: { $regex: new RegExp(`^${district.trim()}$`, 'i') }
                };
            } else {
                // Fallback from Web App: Show all PM products (including legacy)
                query = {
                    ...query,
                    $or: [
                        { sellerRole: 'PRODUCT_MANAGER' },
                        { sellerRole: { $exists: false } }
                    ]
                };
            }
        } else if (user.role === 'PRODUCT_MANAGER') {
            // EXACT WEB APP LOGIC: PMs see products from Farmers in their service districts
            const districts = user.serviceDistricts;
            if (!districts || districts.length === 0) return res.json([]);
            query = {
                ...query,
                districts: { $in: districts },
                sellerRole: 'FARMER'
            };
        }

        console.log(`[ProductAPI] Final MongoDB Query for ${user.email}:`, JSON.stringify(query));

        const products = await Product.find(query)
            .populate("seller", "name email phone")
            .populate("manager", "name email phone");

        // Ensure consistency for frontend (if DB has 'manager' but not 'seller')
        const mappedProducts = products.map(p => {
            const productObj = p.toObject();
            if (!productObj.seller && productObj.manager) {
                productObj.seller = productObj.manager;
            }
            return productObj;
        });

        console.log(`[ProductAPI] Products Found: ${mappedProducts.length}`);
        res.json(mappedProducts);
    } catch (error) {
        console.error("[ProductAPI] ERROR:", error);
        next(error);
    }
};

// @desc    Get manager's own listings
// @route   GET /api/products/my-listings
const getMyListings = async (req, res, next) => {
    try {
        // Find products where current user is either 'seller' or 'manager'
        const products = await Product.find({ 
            $or: [{ seller: req.user._id }, { manager: req.user._id }] 
        }).populate("seller", "name email").populate("manager", "name email");
        
        // Ensure consistency for frontend
        const mappedProducts = products.map(p => {
            const productObj = p.toObject();
            if (!productObj.seller && productObj.manager) {
                productObj.seller = productObj.manager;
            }
            return productObj;
        });

        res.json(mappedProducts);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product listing
// @route   POST /api/products
const createProduct = async (req, res, next) => {
    try {
        const { name, category, description, price, unit, image, stock, districts: customDistricts } = req.body;
        const user = req.user;

        let districts = [];
        if (customDistricts && Array.isArray(customDistricts) && customDistricts.length > 0) {
            // If user provides specific districts, use them and trim them
            districts = customDistricts.filter(d => d && typeof d === 'string').map(d => d.trim());
        } else {
            // Default logic
            if (user.role === 'PRODUCT_MANAGER' && user.serviceDistricts) {
                districts = user.serviceDistricts.map(d => d.trim());
            } else if (user.role === 'FARMER' && user.assignedAsc?.district) {
                districts = [user.assignedAsc.district.trim()];
            }
        }

        if (!districts || districts.length === 0 || !districts[0]) {
            res.status(400);
            throw new Error("You must have a district assigned to list products.");
        }

        const regulatedCategories = ["Animal Health & Nutrition", "Crop Protection", "Crop Nutrients"];
        const status = (user.role === 'PRODUCT_MANAGER' && regulatedCategories.includes(category)) ? "Pending" : "Active";

        const product = await Product.create({
            name,
            category,
            description,
            price,
            unit,
            districts,
            seller: user._id,
            sellerRole: user.role,
            image,
            stock: Number(stock) || 0,
            status
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending products (Admin)
// @route   GET /api/products/pending
const getPendingProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: "Pending" }).populate("seller", "name email");
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Review/Approve a product listing
// @route   PUT /api/products/:id/review
const reviewProduct = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['Active', 'Rejected'].includes(status)) {
            res.status(400);
            throw new Error("Invalid status");
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        product.status = status;
        await product.save();
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        if (product.seller?.toString() !== req.user._id.toString() && 
            product.manager?.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("Not authorized to delete this product");
        }

        await product.deleteOne();
        res.json({ message: "Product removed" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailableProducts,
    getMyListings,
    createProduct,
    getPendingProducts,
    reviewProduct,
    deleteProduct
};
