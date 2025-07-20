import Papa from 'papaparse';

export const parseCsvContent = (csvContent, options = {}) => {
  const defaultOptions = {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
    ...options,
  };

  try {
    const result = Papa.parse(csvContent, defaultOptions);
    
    const parseError = result.errors && result.errors.length > 0 
      ? result.errors.map(err => err.message).join(', ')
      : null;

    return {
      headers: result.meta?.fields || [],
      data: result.data || [],
      error: parseError,
      success: !parseError
    };
  } catch (error) {
    return {
      headers: [],
      data: [],
      error: `Failed to parse CSV: ${error.message}`,
      success: false
    };
  }
};

export const autoMapColumns = (headers, fieldMappings) => {
  const mapping = {};
  
  Object.entries(fieldMappings).forEach(([field, patterns]) => {
    const matchedHeader = headers.find(header => 
      patterns.some(pattern => 
        header.toLowerCase().includes(pattern.toLowerCase())
      )
    );
    mapping[field] = matchedHeader || '';
  });
  
  return mapping;
};

export const validateCsvData = (data, requiredFields, columnMapping) => {
  const validRows = [];
  const invalidRows = [];
  const issues = [];

  data.forEach((row, index) => {
    let isValid = true;
    const rowIssues = [];

    requiredFields.forEach(field => {
      const columnName = columnMapping[field];
      const value = row[columnName];
      
      if (!value || value.trim() === '') {
        isValid = false;
        rowIssues.push(`Missing ${field}`);
      }
    });

    if (isValid) {
      validRows.push({ ...row, _originalIndex: index });
    } else {
      invalidRows.push({
        index: index + 1,
        issues: rowIssues,
        data: row
      });
    }
  });

  return {
    validRows,
    invalidRows,
    hasIssues: invalidRows.length > 0
  };
};
