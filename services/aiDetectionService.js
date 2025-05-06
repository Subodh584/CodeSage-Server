// services/aiDetectionService.js - AI text detection functionality
const fetch = require('node-fetch');
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Detects if text is AI-generated using ZeroGPT API
 * 
 * @param {string} text - Text to analyze
 * @returns {Promise<object>} - Detection results
 */
const detectAIText = async (text) => {
  try {
    if (!text || text.trim() === '') {
      logger.warn('Empty text provided for AI detection');
      return {
        fakePercentage: "0",
        aiWords: "0",
        textWords: "0"
      };
    }

    logger.info(`Sending text to ZeroGPT for AI detection (${text.length} characters)`);
    
    const headers = new Headers();
    headers.append("ApiKey", config.ZEROGPT_API_KEY);
    headers.append("Content-Type", "application/json");
    
    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ "input_text": text }),
      redirect: 'follow'
    };
    
    const response = await fetch("https://api.zerogpt.com/api/detect/detectText", requestOptions);
    
    if (!response.ok) {
      throw new Error(`ZeroGPT API returned status ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`ZeroGPT API error: ${result.message || 'Unknown error'}`);
    }
    
    logger.info(`AI detection completed: ${result.data.fakePercentage}% AI probability`);
    return result.data;
  } catch (error) {
    logger.error(`AI detection failed: ${error.message}`);
    throw new Error(`AI detection failed: ${error.message}`);
  }
};

module.exports = {
  detectAIText
};