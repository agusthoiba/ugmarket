const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for file uploads
const uploadMulter = multer({ dest: '/tmp/upload' }); // Store files in /tmp/upload

// TODO
router.post('/multiple', uploadMulter.array('images', 3), async (req, res) => {

});

router.post('/', uploadMulter.single('image'), async (req, res) => {
    console.log('Received upload request...');
    try {
        // Check if the image file is provided
        // || !req.files.image
        //console.log('req.files:', req.files);
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        const imageFile = req.file; // Assuming the file input name is 'image'

        // Call the uploadToCloud method
        const result = await res.locals.uploadCloudinary.uploadToCloud(imageFile.path, "", imageFile.originalname);
        let previewUrlLast = (result.split('/'))[(result.split('/')).length - 1];

        const { cloudinary } = res.app.locals;
        // Respond with the uploaded image URL
        return res.status(200).json({ 
            error: null,
            url: result,
            preview: cloudinary.url(previewUrlLast, {width: 512})
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while uploading the image.' });
    }
});

module.exports = router;