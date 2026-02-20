import { Router } from 'express';
import multer from 'multer';
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
    removeVendorFromProduct,
    updateProductVendor,
    uploadVendorDocument
} from '../controllers/vendors.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route
router.post('/enquiry', submitVendorEnquiry);

// Public route - get vendors for a product
router.get('/product/:productId', getProductVendors);

const upload = multer({ storage: multer.memoryStorage() });

// Public route for document upload
router.post('/upload', upload.single('document'), uploadVendorDocument);

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
router.put('/assign', updateProductVendor);
router.delete('/assign', removeVendorFromProduct);

export default router;
