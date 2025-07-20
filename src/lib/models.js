// src/lib/models.js
export class Project {
  constructor({ document = null, codes = [], codedSegments = [] } = {}) {
    this.document = document;
    this.codes = codes;
    this.codedSegments = codedSegments;
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
  constructor({ id, name, description = '', color = '#cccccc' }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.color = color;
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