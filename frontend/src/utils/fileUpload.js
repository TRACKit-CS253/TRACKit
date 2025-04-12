/**
 * Utility functions for handling file uploads
 */

// Validate a CSV file
export const validateCSVFile = (file) => {
  if (!file) {
    return { isValid: false, message: 'No file selected' };
  }

  // Check file extension and type
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const validExtensions = ['.csv', '.txt'];
  const validTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/csv'];
  
  const validExtension = validExtensions.includes(fileExtension);
  const validType = validTypes.includes(file.type) || file.type === '';
  
  if (!validExtension && !validType) {
    return { 
      isValid: false, 
      message: `Invalid file type. Please select a CSV file. Received: ${file.type || 'unknown'} with extension ${fileExtension}` 
    };
  }

  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, message: 'File size too large. Maximum size is 5MB.' };
  }

  return { isValid: true };
};

// Create FormData for file upload
export const createFileUploadFormData = (file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};

// Get axios config for file upload
export const getFileUploadConfig = (token, onUploadProgress = null) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
    timeout: 60000, // Increase timeout for large files
  };

  if (onUploadProgress && typeof onUploadProgress === 'function') {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onUploadProgress(percentCompleted);
    };
  }

  return config;
};
