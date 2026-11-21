const fs = require('fs');
const path = require('path');
const { analyzeImageWithAI } = require('./ai');

async function analyzeImage(imagePath, cropName) {
  try {
    // Try AI-based analysis
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    const aiResult = await analyzeImageWithAI(imageBase64, mimeType, cropName);

    if (aiResult) {
      // Parse AI response into structured data
      return {
        diagnosis: aiResult,
        confidence: 'AI-based analysis',
        suggestions: 'Please consult a local agricultural expert to confirm the diagnosis and get specific treatment advice for your region.'
      };
    }

    // Fallback: no AI available
    return {
      diagnosis: 'Image analysis is currently unavailable. The AI service is not configured.',
      confidence: 'N/A',
      suggestions: 'Please consult your local agricultural extension officer or Krishi Vigyan Kendra (KVK) for crop disease diagnosis. You can also contact the Kisan Call Centre at 1800-180-1551 (toll free).'
    };
  } catch (error) {
    console.error('Image analysis error:', error.message);
    return {
      diagnosis: 'Failed to analyze image due to a technical error.',
      confidence: 'N/A',
      suggestions: 'Please try again or consult your local agricultural expert.'
    };
  }
}

module.exports = { analyzeImage };
