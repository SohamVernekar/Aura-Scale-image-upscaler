import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Client } from '@gradio/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from the React frontend (usually port 5173 or 5174)
app.use(cors());
app.use(express.json());

// Ensure the temporary uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer to temporarily save uploaded images
const upload = multer({ dest: 'uploads/' });

/**
 * POST /api/upscale
 * Receives the blurry image and optimization settings from the React frontend,
 * passes them to the Hugging Face AI space, and returns the result.
 */
app.post('/api/upscale', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }

        // Extract configurations sent from the frontend control panel
        const faceUpsample = req.body.faceUpsample === 'true';
        const backgroundEnhance = req.body.backgroundEnhance === 'true';
        const upscaleFactor = parseInt(req.body.upscaleFactor, 10) || 2;
        const fidelity = parseFloat(req.body.fidelity) || 0.6;

        // Read the file buffer to prepare it for the Gradio client
        const imageBuffer = fs.readFileSync(req.file.path);
        const imageBlob = new Blob([imageBuffer], { type: req.file.mimetype });

        console.log(`Connecting to free Hugging Face GPU space for image: ${req.file.originalname}...`);

        const hfToken = process.env.HF_TOKEN;
        const connectOptions = {};
        if (hfToken) {
            const formattedToken = hfToken.trim().replace(/^["']|["']$/g, '');
            connectOptions.hf_token = formattedToken;
            connectOptions.headers = {
                "Authorization": `Bearer ${formattedToken}`
            };
            console.log("Using Hugging Face token for authenticated session (with Bearer header).");
        } else {
            console.log("No Hugging Face token found. Running in anonymous mode (subject to shared rate limits).");
        }

        // List of alternative CodeFormer spaces on Hugging Face as a failover cluster
        const spaces = [
            "sczhou/CodeFormer",
            "leonelhs/CodeFormer",
            "Tzktz/codeformer-face-restorization"
        ];

        let result = null;
        let activeSpace = null;
        let lastError = null;

        for (const space of spaces) {
            try {
                console.log(`Connecting to Hugging Face space: ${space}...`);
                const hfClient = await Client.connect(space, connectOptions);
                activeSpace = space;

                console.log(`Executing AI restoration on ${space}: Face Upsample=${faceUpsample}, Background Enhance=${backgroundEnhance}, Scale=${upscaleFactor}x, Fidelity=${fidelity}`);

                result = await hfClient.predict("/inference", [
                    imageBlob,
                    true, // face_align (pre-align faces for best restoration results)
                    backgroundEnhance,
                    faceUpsample,
                    upscaleFactor,
                    fidelity,
                ]);

                console.log(`Processing successful on space: ${space}`);
                break; // Break loop if prediction succeeds
            } catch (err) {
                console.error(`Error with space ${space}:`, err.message);
                lastError = err;
                
                // If it is a quota/rate limit error or service unavailable, try the next space
                const isRateLimit = err.message.includes("quota") || 
                                    err.message.includes("exceeded") || 
                                    err.message.includes("limit") || 
                                    err.message.includes("rate") ||
                                    err.message.includes("Too Many Requests") ||
                                    err.message.includes("503");
                
                if (isRateLimit) {
                    console.log(`Switching to next fallback space due to rate limits...`);
                    continue;
                } else {
                    // Retry other errors as well (e.g. spaces sleeping)
                    console.log(`Space failed, trying alternative space...`);
                    continue;
                }
            }
        }

        // Clean up the temporary local file to keep server storage empty
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (!result) {
            throw new Error(lastError ? lastError.message : 'All Hugging Face spaces failed to process the image.');
        }

        // The result object contains an array of outputs. Index 0 is the final image URL object.
        if (result && result.data && result.data[0]) {
            let enhancedImageUrl = "";
            if (typeof result.data[0] === 'object' && result.data[0] !== null) {
                enhancedImageUrl = result.data[0].url;
            } else {
                enhancedImageUrl = result.data[0];
            }
            
            console.log(`Returning enhanced image URL from ${activeSpace}:`, enhancedImageUrl);
            return res.json({ success: true, enhancedImage: enhancedImageUrl });
        } else {
            throw new Error('Failed to retrieve processing output from AI model.');
        }

    } catch (error) {
        console.error('Backend Processing Error:', error.message);

        // Ensure temporary file cleanup happens even if an error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
                console.error('Failed to delete temp file:', unlinkErr.message);
            }
        }

        res.status(500).json({
            error: 'Failed to process image.',
            details: error.message
        });
    }
});

// GET /api/download
// Proxy route to bypass browser CORS policies and pop-up blockers by serving the remote image as a direct attachment download.
app.get('/api/download', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).send('URL query parameter is required.');
        }

        console.log(`Proxying image download from remote URL: ${imageUrl}`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const urlObj = new URL(imageUrl);
        const filename = path.basename(urlObj.pathname) || 'enhanced.png';

        res.setHeader('Content-Disposition', `attachment; filename="aurascale_enhanced_${filename}"`);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
        res.send(buffer);
    } catch (error) {
        console.error('Download Proxy Error:', error.message);
        res.status(500).send(`Failed to proxy download: ${error.message}`);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Upscaler backend running seamlessly on port ${PORT}`);
});
