// server.js - Main application entry point
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import modular components
const { performOCR } = require('./services/ocrService');
const { detectAIText } = require('./services/aiDetectionService');
const { logger } = require('./utils/logger');
const config = require('./config');

// Set up Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Configure CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
};
app.use(cors(corsOptions));

// Configure file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// Configure multer
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: config.MAX_FILE_SIZE
  }
});

// Routes
app.post('/api/analyze', upload.array('images', config.MAX_FILES), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    logger.info(`Processing ${req.files.length} images`);
    
    const results = [];
    
    for (const file of req.files) {
      try {
        const extractedText = await performOCR(file.path);
        
        if (!extractedText) {
          results.push({
            imageName: file.originalname,
            extractedText: '',
            humanPercentage: null,
            aiPercentage: null,
            error: 'No text extracted from image'
          });
          continue;
        }
        
        const aiDetectionResult = await detectAIText(extractedText);
        
        results.push({
          imageName: file.originalname,
          extractedText: extractedText,
          humanPercentage: 100 - parseFloat(aiDetectionResult.fakePercentage || 0),
          aiPercentage: parseFloat(aiDetectionResult.fakePercentage || 0),
          detectionDetails: aiDetectionResult
        });
        
      } catch (error) {
        logger.error(`Error processing image ${file.originalname}: ${error.message}`);
        results.push({
          imageName: file.originalname,
          error: `Failed to process: ${error.message}`
        });
      }
    }
    
    res.json({
      success: true,
      results
    });
    
  } catch (error) {
    logger.error(`Server error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred',
      error: error.message
    });
  } finally {
    if (config.DELETE_UPLOADS_AFTER_PROCESSING) {
      for (const file of req.files || []) {
        fs.unlink(file.path, (err) => {
          if (err) logger.error(`Failed to delete file ${file.path}: ${err.message}`);
        });
      }
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start the server
const PORT = process.env.PORT || config.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;