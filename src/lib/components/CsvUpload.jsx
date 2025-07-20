import React, { useState, useContext } from 'react';
import { ProjectContext } from '../../App';
import FileUpload from './FileUpload';
import CsvMapper from './CsvMapper';

function CsvUpload({ 
  config, 
  label, 
  description, 
  className = "" 
}) {
  const { project, updateProject } = useContext(ProjectContext);
  const [csvContent, setCsvContent] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const handleFileUploaded = (fileData) => {
    if (fileData.type === 'csv') {
      setCsvContent(fileData.content);
      setUploadedFileName(fileData.name);
    } else {
      alert(`Please upload a CSV file for ${config.title.toLowerCase()} import.`);
    }
  };

  const handleDataUploaded = () => {
    setCsvContent(null);
    setUploadedFileName(null);
  };

  return (
    <div className={className}>
      <FileUpload
        accept=".csv"
        onFileUploaded={handleFileUploaded}
        label={label}
        description={description}
      />
      
      {uploadedFileName && !csvContent && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
          <p className="text-green-700">✓ Uploaded: {uploadedFileName}</p>
        </div>
      )}

      {csvContent && (
        <CsvMapper 
          csvContent={csvContent} 
          onDataUploaded={handleDataUploaded}
          config={config}
        />
      )}
    </div>
  );
}

export default CsvUpload;
