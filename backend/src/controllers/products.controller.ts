import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import redis from '../services/redis.service';
import { logAdminAction } from '../services/audit.service';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, minPrice, maxPrice, sort, search, low_stock, vendor } = req.query;

        // Generate Cache Key based on query params
        const cacheKey = `products:${JSON.stringify(req.query)}`;

        // Check Cache
        let cachedData = null;
        if (redis.status === 'ready') {
            try {
                cachedData = await redis.get(cacheKey);
                if (cachedData) {
                    return res.json(JSON.parse(cachedData));
                }
            } catch (cacheErr: any) {
                if (!cacheErr.message.includes("enableOfflineQueue options is false")) {
                    console.warn('[Products] Cache GET failed, skipping:', cacheErr.message);
                }
            }
        }

        let query = supabase
            .from('products')
            .select('*, categories(name, slug), profiles:vendor_id(company_name, full_name)', { count: 'exact' });

        // Filtering
        if (category) {
            query = query.eq('category_id', category);
        }

        if (vendor) {
            // Filter by vendor through product_vendors table
            const { data: productIds } = await supabase
                .from('product_vendors')
                .select('product_id')
                .eq('vendor_id', vendor)
                .eq('is_active', true);

            if (productIds && productIds.length > 0) {
                const ids = productIds.map(pv => pv.product_id);
                query = query.in('id', ids);
            } else {
                // No products found for this vendor
                return res.json({ status: 'success', results: 0, data: [] });
            }
        }

        if (minPrice) query = query.gte('price', minPrice);
        if (maxPrice) query = query.lte('price', maxPrice);

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Sorting
        if (sort === 'price_asc') query = query.order('price', { ascending: true });
        else if (sort === 'price_desc') query = query.order('price', { ascending: false });
        else if (sort === 'newest') query = query.order('created_at', { ascending: false });
        else query = query.order('created_at', { ascending: false }); // Default

        const { data, error, count } = await query;

        if (error) throw error;

        let responseData = {
            status: 'success',
            results: count,
            data,
        };

        // Enhance products with vendor information
        if (data && data.length > 0) {
            const enhancedData = await Promise.all(data.map(async (product: any) => {
                const { data: vendors } = await supabase
                    .from('product_vendors')
                    .select('vendor_price, vendor_stock_quantity, is_active')
                    .eq('product_id', product.id)
                    .eq('is_active', true);

                if (vendors && vendors.length > 0) {
                    const prices = vendors
                        .map(v => v.vendor_price)
                        .filter(p => p !== null && p !== undefined);
                    const totalStock = vendors.reduce((sum, v) => sum + (v.vendor_stock_quantity || 0), 0);

                    return {
                        ...product,
                        vendor_count: vendors.length,
                        price_min: prices.length > 0 ? Math.min(...prices) : product.price,
                        price_max: prices.length > 0 ? Math.max(...prices) : product.price,
                        total_vendor_stock: totalStock,
                        has_stock: totalStock > 0
                    };
                }
                return {
                    ...product,
                    vendor_count: 0,
                    price_min: product.price,
                    price_max: product.price,
                    total_vendor_stock: product.stock_quantity || 0,
                    has_stock: (product.stock_quantity || 0) > 0
                };
            }));

            responseData.data = enhancedData;
        }

        // Set Cache (TTL: 1 hour)
        if (redis.status === 'ready') {
            try {
                await redis.setex(cacheKey, 3600, JSON.stringify(responseData));
            } catch (cacheErr: any) {
                if (!cacheErr.message.includes("enableOfflineQueue options is false")) {
                    console.warn('[Products] Cache SET failed:', cacheErr.message);
                }
            }
        }

        res.json(responseData);
    } catch (err) {
        next(err);
    }
};

export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error('[Product Image Upload] Storage error:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        res.status(200).json({ status: 'success', data: { url: publicUrl } });
    } catch (err) {
        next(err);
    }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Fetch base product with primary vendor
        const { data: product, error } = await supabase
            .from('products')
            .select('*, categories(*), profiles:vendor_id(company_name, full_name)')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ message: 'Product not found', error: error.message });
        }

        // Fetch all vendors for this product with their specific data
        const { data: vendors, error: vendorsError } = await supabase
            .from('product_vendors')
            .select(`
                vendor_id,
                vendor_sku,
                vendor_price,
                vendor_stock_quantity,
                vendor_lead_time_days,
                vendor_specifications,
                is_primary,
                priority,
                is_active,
                profiles:vendor_id(id, company_name, full_name, certifications, email)
            `)
            .eq('product_id', id)
            .eq('is_active', true)
            .order('is_primary', { ascending: false })
            .order('priority', { ascending: false });

        if (!vendorsError && vendors) {
            // Attach vendors to product
            product.vendors = vendors;

            // Calculate aggregate vendor data
            if (vendors.length > 0) {
                const prices = vendors
                    .map(v => v.vendor_price)
                    .filter(p => p !== null && p !== undefined);
                const totalStock = vendors.reduce((sum, v) => sum + (v.vendor_stock_quantity || 0), 0);

                product.vendor_count = vendors.length;
                product.price_min = prices.length > 0 ? Math.min(...prices) : product.price;
                product.price_max = prices.length > 0 ? Math.max(...prices) : product.price;
                product.total_vendor_stock = totalStock;
                product.has_stock = totalStock > 0;
            }
        }

        res.json({ status: 'success', data: product });
    } catch (err) {
        next(err);
    }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Basic validation should be here or in middleware
        const { name, price, category_id, vendor_id, slug } = req.body;

        const { data, error } = await supabase
            .from('products')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};


export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ status: 'success', message: 'Product deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { adjustment, absolute, low_stock_threshold, variants, warehouse_location } = req.body;

        // Fetch current product for previous stock info and logging
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock_quantity, name')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const updates: any = {};
        let finalStock = product.stock_quantity;

        if (absolute !== undefined && typeof absolute === 'number') {
            updates.stock_quantity = Math.max(0, absolute);
            finalStock = updates.stock_quantity;
        } else if (adjustment !== undefined && typeof adjustment === 'number') {
            updates.stock_quantity = Math.max(0, (product.stock_quantity || 0) + adjustment);
            finalStock = updates.stock_quantity;
        }

        if (low_stock_threshold !== undefined && typeof low_stock_threshold === 'number') updates.low_stock_threshold = Math.max(0, low_stock_threshold);
        if (variants !== undefined && Array.isArray(variants)) updates.variants = variants;
        if (warehouse_location !== undefined) updates.warehouse_location = warehouse_location;

        if (Object.keys(updates).length > 0) {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Log the inventory update
            await logAdminAction({
                action: 'UPDATE_INVENTORY',
                targetType: 'product',
                targetId: id,
                details: {
                    product_name: product.name,
                    previous_stock: product.stock_quantity,
                    new_stock: finalStock,
                    updates: Object.keys(updates).filter(k => k !== 'stock_quantity')
                },
                status: 'updated'
            });

            return res.json({ status: 'success', data });
        }

        return res.status(400).json({ message: 'Must provide either adjustment or absolute value' });
    } catch (err) {
        next(err);
    }
};

// Get vendor-specific product details
export const getProductVendorDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, vendorId } = req.params;

        const { data, error } = await supabase
            .from('product_vendors')
            .select(`
                *,
                products(*,categories(*)),
                profiles:vendor_id(*)
            `)
            .eq('product_id', productId)
            .eq('vendor_id', vendorId)
            .eq('is_active', true)
            .single();

        if (error) {
            return res.status(404).json({
                status: 'error',
                message: 'Vendor-product association not found',
                error: error.message
            });
        }

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
