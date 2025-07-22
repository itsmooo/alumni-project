const express = require("express")
const cloudinary = require("cloudinary").v2
const upload = require("../middleware/upload")
const { authenticateToken } = require("../middleware/auth")
const axios = require('axios');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload operations
 */

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                   description: Uploaded file URL
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to upload file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const router = express.Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload single file
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'alumni-network',
          public_id: `${req.user._id}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      message: 'File uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

/**
 * @swagger
 * /api/upload/pdf:
 *   post:
 *     summary: Upload a single PDF file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload
 *     responses:
 *       200:
 *         description: PDF uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                   description: Uploaded PDF URL
 *       400:
 *         description: No file uploaded or not a PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to upload PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Upload single PDF file
router.post('/pdf', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Only accept PDF
    if (req.file.mimetype !== 'application/pdf') {
      console.error('File is not a PDF:', req.file.mimetype);
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }

    // Debug: Log file info
    console.log('PDF upload debug:');
    console.log('Original name:', req.file.originalname);
    console.log('Mimetype:', req.file.mimetype);
    console.log('Size:', req.file.size, 'bytes');

    // Optionally: Save buffer to disk for inspection
    // const fs = require('fs');
    // fs.writeFileSync(`/tmp/${req.file.originalname}`, req.file.buffer);

    // Ensure the public_id ends with .pdf
    const originalExt = req.file.originalname.split('.').pop();
    const publicId = `${req.user._id}_${Date.now()}.${originalExt}`;

    // Upload to Cloudinary as raw
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'alumni-network/pdfs',
          public_id: publicId
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload result:', {
              url: result.secure_url,
              bytes: result.bytes,
              format: result.format,
              original_filename: result.original_filename
            });
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    res.json({
      message: 'PDF uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ message: 'Failed to upload PDF', error: error.message });
  }
});

router.get('/pdf/view/:publicId', async (req, res) => {
  const publicId = req.params.publicId;
  const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/alumni-network/pdfs/${publicId}.pdf`;
  try {
    const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Failed to load PDF');
  }
});

module.exports = router
