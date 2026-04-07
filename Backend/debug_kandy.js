require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const ASC = require('./models/ASC');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const kandyAscs = await ASC.find({ district: /Kandy/i });
        console.log(`Found ${kandyAscs.length} ASCs in Kandy.`);
        const kandyAscIds = kandyAscs.map(a => a._id);

        const kandyFarmers = await User.find({ role: 'FARMER', assignedAsc: { $in: kandyAscIds } });
        console.log(`Found ${kandyFarmers.length} Farmers assigned to Kandy ASCs.`);
        if (kandyFarmers.length > 0) {
            console.log('Sample Kandy Farmer:', kandyFarmers[0].name, kandyFarmers[0].email);
        }

        const kandyProducts = await Product.find({ districts: /Kandy/i, status: 'Active' });
        console.log(`Found ${kandyProducts.length} Active products listing Kandy.`);
        if (kandyProducts.length > 0) {
            console.log('Sample Kandy Product:', kandyProducts[0].name, 'Seller:', kandyProducts[0].seller);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
