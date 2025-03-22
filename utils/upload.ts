'use server';

export async function uploadFiles(files: File[]) {
  try {
    if (files.length === 0) {
      return { success: false, message: 'No files provided' };
    }

    // Get the backend URL
    const backendUrl = process.env.THEMISON_BACKEND_URL || 'http://0.0.0.0:8000/';
    const endpoint = `${backendUrl}documents/upload`;
    
    // Process all files in parallel
    const uploadPromises = files.map(async (file) => {
      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Send the file as binary data
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${file.name}"`,
          'X-File-Size': file.size.toString(),
        },
        body: fileBuffer,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status} for file ${file.name}`);
      }
      
      return response.json();
    });
    
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Combine all results
    const allFiles = results.flatMap(result => result.files || []);
    
    return {
      success: true,
      message: `Successfully uploaded ${files.length} files`,
      files: allFiles
    };
  } catch (error) {
    console.error('Error uploading files:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to upload files: ${errorMessage}`};
  }
}