import { Router } from 'express';
import {
    submitVendorEnquiry,
    getVendorEnquiries,
    updateVendorEnquiryStatus,
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    getProductVendors,
    assignVendorToProduct,
    removeVendorFromProduct
} from '../controllers/vendors.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route
router.post('/enquiry', submitVendorEnquiry);

// Public route - get vendors for a product
router.get('/product/:productId', getProductVendors);

// Admin routes
router.use(requireAuth);
router.use(requireAdmin);

router.get('/enquiries', getVendorEnquiries);
router.patch('/enquiries/:id', updateVendorEnquiryStatus);

router.get('/', getVendors);
router.post('/', createVendor);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

router.post('/assign', assignVendorToProduct);
router.delete('/assign', removeVendorFromProduct);

export default router;
