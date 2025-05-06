# OCR and AI Text Detection Server

A Node.js server that processes images using OCR to extract text (including handwritten text) and then checks if the extracted text is AI-generated using the ZeroGPT API.

## Features

- Extracts text from multiple images using Tesseract OCR
- Supports handwritten text extraction
- Detects if text is AI-generated using ZeroGPT API
- Returns detailed analysis results
- Modular architecture
- Comprehensive logging

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration

## Usage

Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

### POST /api/analyze

Analyzes multiple images to extract text and detect if the text is AI-generated.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with one or more images in the "images" field

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "imageName": "example.jpg",
      "extractedText": "The extracted text from the image",
      "humanPercentage": 70,
      "aiPercentage": 30,
      "detectionDetails": {
        "fakePercentage": "30",
        "aiWords": "10",
        "textWords": "50",
        "sentences": [ ... ],
        "originalParagraph": "...",
        "h": "...",
        "collection_id": "...",
        "fileName": "...",
        "id": "...",
        "feedback": "..."
      }
    }
  ]
}
```

### GET /health

Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-12-25T12:00:00.000Z"
}
```

## Configuration

The server can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| OCR_LANGUAGE | OCR language | eng |
| ZEROGPT_API_KEY | ZeroGPT API key | (provided) |
| DELETE_UPLOADS_AFTER_PROCESSING | Delete uploaded files after processing | false |
| LOG_LEVEL | Logging level | info |
| DEBUG_MODE | Enable debug mode | false |

## Testing with Postman

1. Open Postman
2. Create a new POST request to `http://localhost:3000/api/analyze`
3. Go to the "Body" tab
4. Select "form-data"
5. Add a key "images" with type "File" and select multiple image files
6. Send the request

You should receive a JSON response with the results of the OCR and AI detection for each image.

## Dependencies

- express: Web server framework
- multer: File upload handling
- tesseract.js: OCR engine
- node-fetch: HTTP client for API requests
- winston: Logging
- dotenv: Environment variable management
- uuid: Unique ID generation