const mongoose = require('mongoose');
const Purchase = require('./models/Purchase');
const Product = require('./models/Product');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/agrolanka', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    try {
        // Find a test user (Buyer)
        const buyer = await User.findOne({ email: 'farmer@test.com' });
        if (!buyer) throw new Error('Buyer not found');

        // Find a test product
        const product = await Product.findOne({ status: 'Available' });
        if (!product) throw new Error('No available products found');

        console.log(`Testing purchase for product: ${product.name} by user: ${buyer.email}`);

        // Check if seller is the same as buyer
        if (product.seller.toString() === buyer._id.toString()) {
            console.log('NOTICE: Seller is same as buyer. The actual API will block this.');
        }

        // Logic check: status should be 'Available'
        if (product.status !== 'Available') {
            console.log('NOTICE: Product status is not Available. The actual API will block this.');
        }

        console.log('Backend logic check complete. Please verify manually on the mobile app.');
    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        mongoose.connection.close();
    }
}).catch(err => console.error('Connection Error:', err));
