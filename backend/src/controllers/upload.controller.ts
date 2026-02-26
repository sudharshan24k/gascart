import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bucket } = req.params;

        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }

        const validBuckets = ['categories', 'articles', 'platform-documents', 'avatars', 'products'];
        if (!validBuckets.includes(bucket)) {
            return res.status(400).json({ status: 'error', message: 'Invalid storage bucket' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Use user ID as prefix for avatars for RLS compliance
        let filePath = fileName;
        if (bucket === 'avatars' && (req as any).user?.id) {
            filePath = `${(req as any).user.id}/${fileName}`;
        } else if (bucket === 'products') {
            filePath = `product-images/${fileName}`;
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error(`[Upload Controller] Storage error in bucket ${bucket}:`, uploadError);
            throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        res.status(200).json({ status: 'success', data: { url: publicUrl, fileName, bucket, filePath } });
    } catch (err) {
        next(err);
    }
};
