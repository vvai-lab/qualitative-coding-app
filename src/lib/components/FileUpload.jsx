import React, { useState } from 'react';

function FileUpload({ 
  accept = ".txt,.csv", 
  onFileUploaded, 
  label = "Upload File",
  description,
  className = ""
}) {
  const [dragOver, setDragOver] = useState(false);
  const uploadId = useState(() => `file-upload-${Math.random().toString(36).substr(2, 9)}`)[0];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const fileType = file.name.split('.').pop().toLowerCase();
        
        onFileUploaded({
          name: file.name,
          content,
          type: fileType,
          size: file.size
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`mb-2 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileUpload}
          className="hidden"
          id={uploadId}
        />
        <label
          htmlFor={uploadId}
          className="cursor-pointer block"
        >
          <div className="text-sm">
            <p className="font-medium text-gray-700">{label}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Click to browse or drag & drop
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

export default FileUpload;
