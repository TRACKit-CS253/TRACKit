/**
 * This is a simple test script to verify that the file upload middleware
 * is properly configured and working in your Express application.
 * 
 * Usage: Run this file separately with Node.js
 */

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const PORT = 3001;

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure file upload middleware with debugging
app.use(fileUpload({
  debug: true, // Enable debugging
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  abortOnLimit: true,
  responseOnLimit: "File too large"
}));

// Create a test endpoint
app.post('/test-upload', (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Files object:", req.files);
  
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log("No files were uploaded");
    return res.status(400).json({ 
      success: false,
      message: 'No files were uploaded',
      headers: req.headers,
      body: req.body
    });
  }
  
  const file = req.files.file;
  console.log("File details:", {
    name: file.name,
    size: file.size,
    mimetype: file.mimetype,
    md5: file.md5,
    dataLength: file.data.length
  });

  try {
    // Try to read the file as text
    const fileContent = file.data.toString('utf8');
    console.log("File content (first 100 chars):", fileContent.substring(0, 100));
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        contentPreview: fileContent.substring(0, 100)
      }
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({
      success: false,
      message: 'Error processing file',
      error: error.message
    });
  }
});

// Simple HTML form to test file upload
app.get('/test-form', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>File Upload Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        button { padding: 8px 16px; background: #4CAF50; color: white; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>File Upload Test</h1>
      <form action="/test-upload" method="post" enctype="multipart/form-data">
        <div class="form-group">
          <label for="file">Select CSV file:</label>
          <input type="file" id="file" name="file" accept=".csv">
        </div>
        <button type="submit">Upload</button>
      </form>
      <div id="result" style="margin-top: 20px;"></div>
      
      <script>
        document.querySelector('form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          
          try {
            const response = await fetch('/test-upload', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            document.getElementById('result').innerHTML = 
              '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('result').innerHTML = 
              '<p style="color: red;">Error: ' + error.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`File upload test server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/test-form in your browser to test file uploads`);
});
