import React, { useContext, useState, useEffect, useRef } from 'react';
import { ProjectContext } from '../../App';
import { CodedSegment, Document } from '../models';
import FileUpload from './FileUpload';

function DocumentDisplay() {
  const { project, updateProject } = useContext(ProjectContext);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const documentContentRef = useRef(null);

  const selectedDocument = project.document;

  useEffect(() => {
    // Clear selection when document changes
    setSelectedSentence(null);
  }, [selectedDocument]);

  const handleFileUploaded = (fileData) => {
    if (fileData.type === 'txt') {
      const newDocument = new Document({
        id: Date.now().toString(),
        name: fileData.name,
        content: fileData.content,
      });
      updateProject({
        ...project,
        document: newDocument,
        codedSegments: [], // Clear coded segments when a new document is uploaded
      });
    } else {
      alert('Please upload a text (.txt) file for documents.');
    }
  };

  const tokenizeIntoSentences = (text) => {
    // Simple sentence tokenization based on common punctuation
    // This might not be perfect for all cases but serves the purpose for simplification
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    let currentIndex = 0;
    return sentences.map((sentence, index) => {
      const start = text.indexOf(sentence, currentIndex);
      const end = start + sentence.length;
      currentIndex = end;
      return { id: `sentence-${index}`, text: sentence.trim(), start, end };
    });
  };

  const handleSentenceClick = (sentence) => {
    setSelectedSentence(sentence);
  };

  const handleAddSegment = () => {
    if (!selectedDocument || !selectedSentence) {
      alert("Please select a sentence to create a segment.");
      return;
    }

    const newSegment = new CodedSegment({
      id: Date.now().toString(),
      documentId: selectedDocument.id,
      codeId: null,
      text: selectedSentence.text,
      start: selectedSentence.start,
      end: selectedSentence.end,
    });

    updateProject({
      ...project,
      codedSegments: [...project.codedSegments, newSegment],
    });

    // Clear selection after adding segment
    setSelectedSentence(null);
  };

  const renderDocumentContent = () => {
    if (!selectedDocument) return null;

    const sentences = tokenizeIntoSentences(selectedDocument.content);
    const codedSegments = project.codedSegments.filter(s => s.documentId === selectedDocument.id);

    return sentences.map((sentence) => {
      const isCoded = codedSegments.some(
        (segment) => segment.text === sentence.text
      );
      const isSelected = selectedSentence && selectedSentence.id === sentence.id;

      const segmentStyle = {};
      if (isCoded) {
        // Find the code for the segment if its text matches the sentence text
        const matchingSegment = codedSegments.find(
          (segment) => segment.text === sentence.text
        );
        if (matchingSegment) {
          const code = project.codes.find(c => c.id === matchingSegment.codeId);
          if (code) {
            segmentStyle.backgroundColor = code.color + '40'; // 40 for transparency
          } else {
            segmentStyle.backgroundColor = '#cccccc40'; // Default for uncoded segments
          }
        }
      }

      return (
        <span
          key={sentence.id}
          className={`cursor-pointer hover:bg-blue-200 ${isSelected ? 'bg-yellow-200' : ''}`}
          style={segmentStyle}
          onClick={() => handleSentenceClick(sentence)}
        >
          {sentence.text}
        </span>
      );
    });
  };

  return (
    <div className="p-0.5 bg-gray-50 h-full text-xs flex flex-col">
      <h2 className="text-base font-semibold mb-1">Document</h2>
      
      <FileUpload
        accept=".txt"
        onFileUploaded={handleFileUploaded}
        label="Load Document"
        description="Upload a text file to analyze"
      />

      {project.document && (
        <div className="mb-1 p-1 bg-green-50 border border-green-200 rounded text-xs">
          <h3 className="text-sm font-medium">Current Document:</h3>
          <p className="text-gray-700 text-xs">{project.document.name}</p>
        </div>
      )}
      {selectedDocument ? (
        <div className="flex flex-col flex-1">
          <div
            ref={documentContentRef}
            className="border p-0.5 rounded bg-white whitespace-pre-wrap flex-1 overflow-y-auto text-xs"
          >
            {renderDocumentContent()}
          </div>
          {selectedSentence && (
            <div className="mt-1 p-0.5 bg-blue-100 border border-blue-200 rounded text-xs">
              <p className="font-semibold text-xs">Selected Sentence:</p>
              <p className="italic text-xs">"{selectedSentence.text}"</p>
              <div className="mt-1">
                <button
                  onClick={handleAddSegment}
                  className="px-2 py-0.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                >
                  Create Segment
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-600 text-xs">No document loaded.</p>
        </div>
      )}
    </div>
  );
}

export default DocumentDisplay;


 
