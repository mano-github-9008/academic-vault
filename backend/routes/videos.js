const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// GET /api/videos — list videos (optional filters: semester, search)
router.get('/', async (req, res) => {
    try {
        const { semester, search, subject } = req.query;

        let query = supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (semester) {
            query = query.eq('semester', parseInt(semester));
        }

        if (subject) {
            query = query.eq('subject', subject);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Supabase Query Error:', error);
            return res.status(400).json({ error: error.message || 'Database query failed' });
        }
        res.json(data || []);
    } catch (err) {
        console.error('Full Video Fetch Error:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch videos' });
    }
});

// POST /api/videos — add video metadata
router.post('/', async (req, res) => {
    try {
        const { title, url, subject, semester } = req.body;

        if (!title || !url || !subject || !semester) {
            return res.status(400).json({ error: 'All fields are required (title, url, subject, semester)' });
        }

        const { data, error } = await supabase
            .from('videos')
            .insert({
                title,
                url,
                subject,
                semester: parseInt(semester)
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('Add video error:', err);
        res.status(500).json({ error: 'Failed to register video' });
    }
});

// DELETE /api/videos/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Video removed from library' });
    } catch (err) {
        console.error('Delete video error:', err);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

module.exports = router;
