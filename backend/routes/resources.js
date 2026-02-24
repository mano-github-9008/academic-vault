const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const supabase = require('../lib/supabase');

// Multer config — store files in memory for streaming to Supabase
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.txt', '.zip'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${ext} is not allowed`));
        }
    }
});

// GET /api/resources — list resources (optional filters: semester, search)
router.get('/', async (req, res) => {
    if (!supabase) return res.status(503).json({ error: 'Database service unavailable' });
    try {
        const { semester, search, category } = req.query;

        let query = supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (semester) {
            query = query.eq('semester', parseInt(semester));
        }

        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('List resources error:', err);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// POST /api/resources/upload — file upload (now public)
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!supabase) return res.status(503).json({ error: 'Database service unavailable' });
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const { title, semester, category } = req.body;

        if (!title || !semester) {
            return res.status(400).json({ error: 'Title and semester are required' });
        }

        const semesterNum = parseInt(semester);
        if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
            return res.status(400).json({ error: 'Semester must be between 1 and 8' });
        }

        // Generate a unique file path in storage
        const ext = path.extname(req.file.originalname);
        const timestamp = Date.now();
        const storagePath = `semester-${semesterNum}/${timestamp}-${req.file.originalname}`;

        // Upload file to Supabase Storage
        console.log('Initiating Supabase storage upload for:', storagePath);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('academic-files')
            .upload(storagePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error('SUPABASE STORAGE ERROR:', JSON.stringify(uploadError, null, 2));
            return res.status(500).json({
                error: 'Failed to upload file to storage',
                details: uploadError.message,
                code: uploadError.code
            });
        }

        // Insert metadata into resources table
        const { data: resource, error: dbError } = await supabase
            .from('resources')
            .insert({
                title,
                file_url: uploadData.path,
                file_name: req.file.originalname,
                file_size: req.file.size,
                semester: semesterNum,
                category: category || 'General',
                uploaded_by: null // No user context
            })
            .select()
            .single();

        if (dbError) {
            console.error('SUPABASE DB ERROR:', JSON.stringify(dbError, null, 2));
            // Rollback: delete the uploaded file if DB insert fails
            await supabase.storage.from('academic-files').remove([storagePath]);
            return res.status(500).json({
                error: 'Failed to save resource metadata',
                details: dbError.message
            });
        }

        res.status(201).json(resource);
    } catch (err) {
        console.error('GENERAL UPLOAD EXCEPTION:', err);
        res.status(500).json({
            error: 'Upload failed',
            details: err.message
        });
    }
});

// GET /api/resources/download/:id — generate a temporary signed URL
router.get('/download/:id', async (req, res) => {
    if (!supabase) return res.status(503).json({ error: 'Database service unavailable' });
    try {
        const { id } = req.params;

        // Fetch the resource to get file_url
        const { data: resource, error: fetchError } = await supabase
            .from('resources')
            .select('file_url, file_name')
            .eq('id', id)
            .single();

        if (fetchError || !resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // Create a signed URL valid for 60 seconds
        const { data: signedData, error: signError } = await supabase.storage
            .from('academic-files')
            .createSignedUrl(resource.file_url, 60);

        if (signError) {
            return res.status(500).json({ error: 'Failed to generate download URL' });
        }

        res.json({
            url: signedData.signedUrl,
            fileName: resource.file_name
        });
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to generate download link' });
    }
});

// DELETE /api/resources/:id — file delete (now public)
router.delete('/:id', async (req, res) => {
    if (!supabase) return res.status(503).json({ error: 'Database service unavailable' });
    try {
        const { id } = req.params;

        // Fetch the resource to get file path
        const { data: resource, error: fetchError } = await supabase
            .from('resources')
            .select('file_url')
            .eq('id', id)
            .single();

        if (fetchError || !resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // Delete file from storage
        const { error: storageError } = await supabase.storage
            .from('academic-files')
            .remove([resource.file_url]);

        if (storageError) {
            console.error('Storage delete error:', storageError);
        }

        // Delete metadata from DB
        const { error: dbError } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);

        if (dbError) {
            return res.status(500).json({ error: 'Failed to delete resource' });
        }

        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

module.exports = router;
