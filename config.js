// config.js - Application configuration
require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10, // Maximum number of files per request
  DELETE_UPLOADS_AFTER_PROCESSING: process.env.DELETE_UPLOADS_AFTER_PROCESSING === 'true' || false,
  
  // OCR configuration
  OCR_LANGUAGE: process.env.OCR_LANGUAGE || 'eng',
  
  // AI Detection configuration
  ZEROGPT_API_KEY: process.env.ZEROGPT_API_KEY || '4923fc68-10a8-491e-bdb4-d3addb7ed82d',
  
  // Logging configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  DEBUG_MODE: process.env.DEBUG_MODE === 'true' || false
};