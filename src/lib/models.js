// src/lib/models.js
import { ColorGenerator } from './colorGenerator.js';

export class Project {
  constructor({ document = null, codes = [], codedSegments = [] } = {}) {
    this.document = document;
    this.codes = codes;
    this.codedSegments = codedSegments;
    
    // Initialize color tracking when creating a project
    ColorGenerator.initializeFromExistingCodes(codes);
  }
}

export class Document {
  constructor({ id, name, content }) {
    this.id = id;
    this.name = name;
    this.content = content;
  }
}

export class Code {
  constructor({ id, name, description = '', inclusion = '', exclusion = '', color = null, existingCodes = [] }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.inclusion = inclusion;
    this.exclusion = exclusion;
    
    // Auto-assign color if not provided
    this.color = color || ColorGenerator.getColorForNewCode(existingCodes);
  }
}

export class CodedSegment {
  constructor({ id, documentId, codeId, text, start, end }) {
    this.id = id;
    this.documentId = documentId;
    this.codeId = codeId;
    this.text = text;
    this.start = start;
    this.end = end;
  }
}