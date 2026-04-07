require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const ASC = require('./models/ASC');

async function verify() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Find a farmer
        const farmer = await User.findOne({ role: 'FARMER' }).populate('assignedAsc');
        if (!farmer) {
            console.log('No farmer found in database to test.');
            process.exit(0);
        }

        const district = farmer.assignedAsc?.district?.trim();
        console.log(`Testing for Farmer: ${farmer.name}, District: ${district || 'NONE'}`);

        if (!district) {
            console.log('Farmer has no district. Products should be empty.');
        }

        // Simulate backend query
        let query = { status: "Active" };
        if (district) {
            query.districts = { $regex: new RegExp(`^${district}$`, 'i') };
        }
        query.seller = { $ne: farmer._id };

        console.log('Executing query:', JSON.stringify(query));
        const products = await Product.find(query);
        console.log(`Found ${products.length} products for this farmer.`);

        if (products.length > 0) {
            console.log('Sample matching product:', products[0].name, 'Category:', products[0].category);
        } else {
            console.log('No products found matching the criteria.');
            // Check if ANY products exist for this district at all
            const anyInDistrict = await Product.find({ districts: { $regex: new RegExp(`^${district}$`, 'i') } });
            console.log(`Total products in this district regardless of status/seller: ${anyInDistrict.length}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error during verification:', err);
        process.exit(1);
    }
}

verify();
