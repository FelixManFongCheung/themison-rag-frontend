'use server';

export async function uploadFiles(files: File[]) {
  try {
    if (files.length === 0) {
      return { success: false, message: 'No files provided' };
    }

    // Create FormData to send to the external backend
    const formData = new FormData();
    
    // Append each file to the FormData
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    // Send the files to the external backend
    const backendUrl = process.env.THEMISON_BACKEND_URL || 'http://0.0.0.0:8000/';
    
    const response = await fetch(`${backendUrl}documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    return { 
      success: true, 
      message: `Successfully uploaded ${files.length} files`,
      files: result.files || []
    };
  } catch (error) {
    console.error('Error uploading files:', error);
    return { success: false, message: 'Failed to upload files' };
  }
}