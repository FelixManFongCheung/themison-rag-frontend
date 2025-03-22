"use client";
import { useState, useRef, DragEvent } from "react";
import { uploadFiles } from "@/utils/upload";

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('in now');
    
    
    const targetFiles = e.target.files;
    if (targetFiles) {
      
      if (files.length > 0) {
        setFiles((prevFiles) => {
          return [...prevFiles, ...Array.from(targetFiles)];
        });
      } else {
        setFiles(Array.from(targetFiles));
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      // Filter for PDF files if needed
      const pdfFiles = Array.from(droppedFiles).filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfFiles.length > 0) {
        // Use the same logic as handleFileChange for consistency
        if (files.length > 0) {
          setFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
        } else {
          setFiles(pdfFiles);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    
    try {
      const result = await uploadFiles(files);
      if (result.success) {
        setState("success");
        console.log(result.message);
        // Clear files after successful upload
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setState("error");
        console.error(result.message);
      }
    } catch (error) {
      setState("error");
      console.error("Upload failed:", error);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form className="flex flex-col items-center justify-center" onSubmit={handleSubmit}>
        <div
          className={`w-[500px] h-[300px] border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${state === "error" ? 'border-red-500' : ''}
            ${state === "success" ? 'border-green-500' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            type="file"
            accept=".pdf"
            multiple
          />
          
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-gray-400 mb-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PDF files only</p>
          
          {files.length > 0 && (
            <div className="mt-4 w-full">
              <p className="text-sm font-medium text-gray-700">Selected files:</p>
              <ul className="mt-2 text-sm text-gray-600 max-h-[100px] overflow-y-auto">
                {files.map((file, index) => (
                  <li key={index} className="truncate">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={files.length === 0 || state === "loading"}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {state === "loading" ? "Uploading..." : "Upload"}
        </button>
      </form>
      
      {state === "success" && (
        <p className="mt-4 text-green-600">Files uploaded successfully!</p>
      )}
      
      {state === "error" && (
        <p className="mt-4 text-red-600">Upload failed. Please try again.</p>
      )}
    </div>
  );
}
