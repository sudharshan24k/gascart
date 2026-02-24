const Razorpay = require('razorpay');
const key = '';
exports.razorpayInstance = new Razorpay({
    key_id: key || 'rzp_test_dummy_key',
    key_secret: 'dummy_secret'
});
