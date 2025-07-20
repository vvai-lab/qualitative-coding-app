import { Code, CodedSegment } from './models';

export const codeMapperConfig = {
  title: 'Codes',
  fields: [
    { key: 'name', label: 'Name', optional: false },
    { key: 'description', label: 'Description', optional: true },
    { key: 'color', label: 'Color', optional: true }
  ],
  autoMapPatterns: {
    name: ['name', 'code', 'title', 'label'],
    description: ['description', 'desc', 'definition', 'meaning'],
    color: ['color', 'colour', 'hex', 'background']
  },
  requiredFields: ['name'],
  
  createItem: (row, columnMapping, index, project) => {
    const name = row[columnMapping.name].trim();
    const description = columnMapping.description ? (row[columnMapping.description] || '').trim() : '';
    let color = columnMapping.color ? (row[columnMapping.color] || '#cccccc') : '#cccccc';

    // Validate color format if provided
    if (color && !color.startsWith('#')) {
      if (/^[0-9A-Fa-f]{6}$/.test(color)) {
        color = '#' + color;
      } else if (/^[0-9A-Fa-f]{3}$/.test(color)) {
        color = '#' + color;
      } else {
        color = '#cccccc'; // fallback to default
      }
    }

    return new Code({
      id: `code-${Date.now()}-${index}`,
      name: name,
      description: description,
      color: color,
    });
  },

  getExistingItems: (project) => project.codes,

  duplicateCheck: (newCode, existingCodes) => {
    return existingCodes.some(code => code.name.toLowerCase() === newCode.name.toLowerCase());
  },

  updateProjectData: (project, newItems, importMode, updateProject) => {
    const updatedCodes = importMode === 'overwrite' 
      ? newItems  // Replace all codes
      : [...project.codes, ...newItems]; // Append to existing codes

    updateProject({
      ...project,
      codes: updatedCodes,
      // If overwriting codes, clear code assignments from segments
      ...(importMode === 'overwrite' && {
        codedSegments: project.codedSegments.map(segment => ({
          ...segment,
          codeId: null,
          codeIds: []
        }))
      })
    });
  },

  previewRenderer: (row, columnMapping) => {
    const name = row[columnMapping.name] || '(empty)';
    const description = columnMapping.description ? (row[columnMapping.description] || '(no description)') : '';
    const color = columnMapping.color ? (row[columnMapping.color] || '#cccccc') : '';
    
    return `${name}${description ? ` - ${description}` : ''}${color ? ` [${color}]` : ''}`;
  }
};

export const segmentMapperConfig = {
  title: 'Segments',
  fields: [
    { key: 'text', label: 'Segment Text', optional: false }
  ],
  autoMapPatterns: {
    text: ['text', 'sentence', 'segment', 'content', 'message', 'quote']
  },
  requiredFields: ['text'],

  createItem: (row, columnMapping, index, project) => {
    const text = row[columnMapping.text].trim();
    
    return new CodedSegment({
      id: `segment-${Date.now()}-${index}`,
      documentId: project?.document?.id || null, // Allow null if no document is loaded
      codeId: null, // No code assigned during import
      codeIds: [], // Initialize empty array for multi-code support
      text: text,
      start: 0,
      end: text.length,
    });
  },

  getExistingItems: (project) => project.codedSegments,

  duplicateCheck: null, // No duplicate check for segments

  updateProjectData: (project, newItems, importMode, updateProject) => {
    const updatedSegments = importMode === 'overwrite'
      ? newItems  // Replace all segments
      : [...project.codedSegments, ...newItems]; // Append to existing segments

    updateProject({
      ...project,
      codedSegments: updatedSegments,
    });
  },

  additionalValidation: (project) => {
    // No additional validation needed for segments
    return true;
  },

  previewRenderer: (row, columnMapping) => {
    const text = row[columnMapping.text] || '(empty)';
    return `"${text}"`;
  }
};
