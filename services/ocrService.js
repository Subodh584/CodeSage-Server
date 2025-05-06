// services/ocrService.js - OCR text extraction functionality
const Tesseract = require('tesseract.js');
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Extracts text from an image using OCR
 * 
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
const performOCR = async (imagePath) => {
  try {
    logger.info(`Performing OCR on image: ${imagePath}`);
    
    const { data } = await Tesseract.recognize(
      imagePath,
      config.OCR_LANGUAGE,
      {
        logger: m => {
          if (config.DEBUG_MODE) {
            logger.debug(`OCR Progress: ${m.status} - ${Math.floor(m.progress * 100)}%`);
          }
        }
      }
    );
    
    logger.info(`OCR completed successfully for ${imagePath}`);
    return data.text;
  } catch (error) {
    logger.error(`OCR failed for ${imagePath}: ${error.message}`);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

module.exports = {
  performOCR
};