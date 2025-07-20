import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../../App';
import { parseCsvContent, autoMapColumns, validateCsvData } from '../utils/csvParser';

function CsvMapper({ 
  csvContent, 
  onDataUploaded, 
  config 
}) {
  const { project, updateProject } = useContext(ProjectContext);
  const [headers, setHeaders] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [importMode, setImportMode] = useState('append');

  const {
    title,
    fields,
    autoMapPatterns,
    requiredFields,
    createItem,
    getExistingItems,
    updateProjectData,
    duplicateCheck,
    previewRenderer,
    additionalValidation
  } = config;

  useEffect(() => {
    if (csvContent) {
      const result = parseCsvContent(csvContent);
      
      if (result.error) {
        setParseError(result.error);
        setHeaders([]);
        setParsedData([]);
      } else {
        setParseError(null);
        setHeaders(result.headers);
        setParsedData(result.data);
        
        // Auto-map common column names
        const mapping = autoMapColumns(result.headers, autoMapPatterns);
        setColumnMapping(prev => ({ ...prev, ...mapping }));
      }
    }
  }, [csvContent, autoMapPatterns]);

  const handleMappingChange = (field, header) => {
    setColumnMapping(prev => ({ ...prev, [field]: header }));
  };

  const handleProcessCsv = () => {
    // Validate required fields are mapped
    const missingFields = requiredFields.filter(field => !columnMapping[field]);
    if (missingFields.length > 0) {
      alert(`Please select columns for: ${missingFields.join(', ')}`);
      return;
    }

    // Additional validation if provided
    if (additionalValidation && !additionalValidation(project)) {
      return;
    }

    // Validate the data
    const validation = validateCsvData(parsedData, requiredFields, columnMapping);
    
    const newItemsToAdd = [];
    const duplicateItems = [];

    validation.validRows.forEach((row, index) => {
      const item = createItem(row, columnMapping, index, project);
      
      // Check for duplicates only in append mode
      if (importMode === 'append' && duplicateCheck) {
        const existingItems = getExistingItems(project);
        if (duplicateCheck(item, existingItems)) {
          duplicateItems.push(item);
          return;
        }
      }

      newItemsToAdd.push(item);
    });

    // Show summary of what will be processed
    let message = `Ready to ${importMode} ${newItemsToAdd.length} ${title.toLowerCase()}.`;
    
    const existingItems = getExistingItems(project);
    if (importMode === 'overwrite') {
      message += `\n\nThis will replace all ${existingItems.length} existing ${title.toLowerCase()}.`;
    } else {
      if (duplicateItems.length > 0) {
        message += `\n\nSkipped ${duplicateItems.length} duplicate ${title.toLowerCase()}: ${duplicateItems.slice(0, 3).map(item => item.name || item.text || 'unnamed').join(', ')}${duplicateItems.length > 3 ? '...' : ''}`;
      }
    }
    
    if (validation.invalidRows.length > 0) {
      message += `\n\nSkipped ${validation.invalidRows.length} rows with missing required fields.`;
    }

    if (newItemsToAdd.length === 0) {
      alert(`No valid ${title.toLowerCase()} to add. All items either have missing required fields or already exist.`);
      return;
    }

    if (confirm(message + '\n\nProceed?')) {
      updateProjectData(project, newItemsToAdd, importMode, updateProject);
      onDataUploaded();
    }
  };

  return (
    <div className="p-3 border rounded-lg shadow-sm bg-gray-50 mt-3 max-h-96 overflow-y-auto">
      <h3 className="text-base font-medium mb-2">CSV Column Mapping for {title}</h3>
      
      {parseError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <p className="text-red-700 font-medium">CSV Parsing Error:</p>
          <p className="text-red-600">{parseError}</p>
        </div>
      )}

      {headers.length > 0 ? (
        <div>
          <p className="mb-3 text-sm text-gray-600">
            Found {parsedData.length} rows. Map your CSV columns:
          </p>
          
          <div className="space-y-2 mb-4">
            {fields.map(field => (
              <div key={field.key} className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 w-24">
                  {field.label}:
                </label>
                <select
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  value={columnMapping[field.key] || ''}
                >
                  <option value="">Select Column{field.optional ? ' (Optional)' : ''}</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
                {!field.optional && <span className="text-sm text-red-500">*</span>}
              </div>
            ))}

            {/* Import Mode Selection */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700 w-24">Import Mode:</label>
              <div className="flex-1 flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`importMode-${title}`}
                    value="append"
                    checked={importMode === 'append'}
                    onChange={(e) => setImportMode(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Append to existing {title.toLowerCase()}</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`importMode-${title}`}
                    value="overwrite"
                    checked={importMode === 'overwrite'}
                    onChange={(e) => setImportMode(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-orange-600">Replace all {title.toLowerCase()}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Info box about import mode */}
          <div className={`mb-4 p-3 rounded text-sm ${
            importMode === 'overwrite' 
              ? 'bg-orange-50 border border-orange-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            {importMode === 'overwrite' ? (
              <div>
                <p className="text-orange-700 font-medium">⚠️ Overwrite Mode</p>
                <p className="text-orange-600">
                  This will delete all existing {title.toLowerCase()} and related data. 
                  Current {title.toLowerCase()}: {getExistingItems(project).length}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-blue-700 font-medium">📝 Append Mode</p>
                <p className="text-blue-600">
                  New {title.toLowerCase()} will be added to existing ones. Duplicates will be skipped.
                  Current {title.toLowerCase()}: {getExistingItems(project).length}
                </p>
              </div>
            )}
          </div>

          {/* Preview section */}
          {columnMapping[requiredFields[0]] && parsedData.length > 0 && previewRenderer && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Preview (first 3 rows):</h4>
              <div className="space-y-1">
                {parsedData.slice(0, 3).map((row, index) => (
                  <div key={index}>
                    {previewRenderer(row, columnMapping)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleProcessCsv}
              disabled={requiredFields.some(field => !columnMapping[field])}
              className={`px-4 py-2 rounded text-sm font-medium ${
                requiredFields.some(field => !columnMapping[field])
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : importMode === 'overwrite'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {importMode === 'overwrite' ? `Replace All ${title}` : `Add ${title}`}
            </button>
            <button
              onClick={onDataUploaded}
              className="px-4 py-2 rounded text-sm font-medium bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Upload a CSV file to see mapping options.</p>
      )}
    </div>
  );
}

export default CsvMapper;
