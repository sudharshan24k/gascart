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

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bucket, filename } = req.params;

        // Path might contain user prefixes, but for generic Admin library we delete by exact filename passed in the path.
        // Wait, the client passes the filename. But in the bucket it might be `avatar/filename.ext`. 
        // We can just use the exact path passed as the `filename` parameter if we use a catch-all route, 
        // or accept the path in the body to avoid URL encoding issues.
        const filePath = req.body.path || filename;

        const validBuckets = ['categories', 'articles', 'platform-documents', 'avatars', 'products'];
        if (!validBuckets.includes(bucket)) {
            return res.status(400).json({ status: 'error', message: 'Invalid storage bucket' });
        }

        const { error } = await supabase.storage.from(bucket).remove([filePath]);

        if (error) {
            console.error(`[Upload Controller] Storage delete error in bucket ${bucket}:`, error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }

        res.status(200).json({ status: 'success', message: 'File deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const renameFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bucket } = req.params;
        const { oldPath, newPath } = req.body;

        if (!oldPath || !newPath) {
            return res.status(400).json({ status: 'error', message: 'oldPath and newPath are required' });
        }

        const validBuckets = ['categories', 'articles', 'platform-documents', 'avatars', 'products'];
        if (!validBuckets.includes(bucket)) {
            return res.status(400).json({ status: 'error', message: 'Invalid storage bucket' });
        }

        const { error } = await supabase.storage.from(bucket).move(oldPath, newPath);

        if (error) {
            console.error(`[Upload Controller] Storage move error in bucket ${bucket}:`, error);
            throw new Error(`Failed to rename file: ${error.message}`);
        }

        res.status(200).json({ status: 'success', message: 'File renamed successfully' });
    } catch (err) {
        next(err);
    }
};

export const listFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bucket } = req.params;

        const validBuckets = ['categories', 'articles', 'platform-documents', 'avatars', 'products'];
        if (!validBuckets.includes(bucket)) {
            return res.status(400).json({ status: 'error', message: 'Invalid storage bucket' });
        }

        // Helper to fetch files, including those inside subfolders (1 level deep)
        const fetchFiles = async (path = '') => {
            const { data, error } = await supabase.storage
                .from(bucket)
                .list(path, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

            if (error) throw error;
            return data || [];
        };

        const rootItems = await fetchFiles();
        let allFiles: any[] = [];

        for (const item of rootItems) {
            // In Supabase Storage, folders don't have an ID, or have a specific metadata structure
            // If it's a folder, we fetch its contents
            if (!item.id && !item.metadata) {
                const subItems = await fetchFiles(item.name);
                const itemsWithPath = subItems.map(subItem => ({
                    ...subItem,
                    name: `${item.name}/${subItem.name}`
                }));
                allFiles = [...allFiles, ...itemsWithPath];
            } else {
                allFiles.push(item);
            }
        }

        res.status(200).json({ status: 'success', data: allFiles });
    } catch (err: any) {
        console.error(`[Upload Controller] Storage list error in bucket ${req.params.bucket}:`, err);
        next(err);
    }
};
