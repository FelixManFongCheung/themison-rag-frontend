"use server";

export async function uploadFiles(files: FormData[]) {
  try {
    if (files.length === 0) {
      return { success: false, message: "No files provided" };
    }

    // Get the backend URL
    const backendUrl =
      process.env.THEMISON_BACKEND_URL || "http://0.0.0.0:8000/";
    const endpoint = `${backendUrl}/documents/upload`;

    // Create a single FormData object to hold all files
    const combinedFormData = new FormData();

    // Add all files to the combined FormData
    files.forEach((singleFileFormData) => {
      const file = singleFileFormData.get("file") as File;
      // Use a unique key for each file by adding an index
      combinedFormData.append("files", file);
    });

    // Send a single request with all files
    const response = await fetch(endpoint, {
      method: "POST",
      body: combinedFormData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: `Successfully uploaded ${files.length} files`,
      files: result.files || [],
    };
  } catch (error) {
    console.error("Error uploading files:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Failed to upload files: ${errorMessage}`,
    };
  }
}
