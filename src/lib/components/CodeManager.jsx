import React, { useContext, useState } from 'react';
import { ProjectContext } from '../../App';
import { Code } from '../models';
import { ColorGenerator } from '../colorGenerator';
import CsvUpload from './CsvUpload';
import { codeMapperConfig } from '../csvMapperConfigs.js';

function CodeManager() {
  const { project, updateProject } = useContext(ProjectContext);
  const [editingCodeId, setEditingCodeId] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'name', 'description', or 'color'
  const [editingValue, setEditingValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newCode, setNewCode] = useState({ name: '', description: '', color: null });
  const [searchTerm, setSearchTerm] = useState('');

  // Get preview color for new code (either selected or auto-assigned)
  const getNewCodePreviewColor = () => {
    return newCode.color || ColorGenerator.getColorForNewCode(project.codes);
  };

  const handleAddNewCode = () => {
    if (newCode.name.trim() === '') return;
    const code = new Code({
      id: Date.now().toString(),
      name: newCode.name.trim(),
      description: newCode.description.trim(),
      color: newCode.color, // Use selected color or null for auto-assignment
      existingCodes: project.codes
    });
    updateProject({
      ...project,
      codes: [...project.codes, code],
    });
    setNewCode({ name: '', description: '', color: null });
    setAddingNew(false);
  };

  const cancelAddNew = () => {
    setNewCode({ name: '', description: '', color: null });
    setAddingNew(false);
  };

  const handleColorChange = (codeId, newColor) => {
    updateProject({
      ...project,
      codes: project.codes.map(code =>
        code.id === codeId ? { ...code, color: newColor } : code
      ),
    });
  };

  const startEditing = (codeId, field, currentValue) => {
    setEditingCodeId(codeId);
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const saveEdit = () => {
    if (editingValue.trim() === '' && editingField === 'name') return;
    
    updateProject({
      ...project,
      codes: project.codes.map(code =>
        code.id === editingCodeId
          ? { ...code, [editingField]: editingValue.trim() }
          : code
      ),
    });
    
    setEditingCodeId(null);
    setEditingField(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingCodeId(null);
    setEditingField(null);
    setEditingValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (addingNew) {
        handleAddNewCode();
      } else {
        saveEdit();
      }
    } else if (e.key === 'Escape') {
      if (addingNew) {
        cancelAddNew();
      } else {
        cancelEdit();
      }
    }
  };

  const handleDeleteCode = (codeId) => {
    updateProject({
      ...project,
      codes: project.codes.filter(code => code.id !== codeId),
      codedSegments: project.codedSegments.map(segment => ({
        ...segment,
        codeIds: (segment.codeIds || []).filter(id => id !== codeId),
        codeId: segment.codeId === codeId ? null : segment.codeId
      })),
    });
  };

  // Filter codes based on search term
  const getFilteredCodes = () => {
    if (!searchTerm.trim()) return project.codes;
    return project.codes.filter(code => 
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.description && code.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="p-0.5 bg-gray-50 text-xs flex flex-col h-full">
      <h2 className="text-base font-semibold mb-0.5">Codes</h2>

      <CsvUpload 
        config={codeMapperConfig}
        label="Import Codes from CSV"
        description="Upload CSV file with code definitions"
      />

      <div className="flex flex-col flex-1 min-h-0">
        {/* Search bar */}
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 rounded">
          <ul className="space-y-1 p-1">
            {/* Show filtered codes */}
            {getFilteredCodes().map((code) => (
              <li
                key={code.id}
                className="flex items-center justify-between p-2 bg-white rounded shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center flex-1">
                  {/* Clickable color dot */}
                  <div className="relative mr-2">
                    <span
                      className="inline-block w-4 h-4 rounded-full cursor-pointer border border-gray-300 hover:border-gray-500"
                      style={{ backgroundColor: code.color }}
                      onClick={() => document.getElementById(`color-${code.id}`).click()}
                      title="Click to change color"
                    ></span>
                    <input
                      id={`color-${code.id}`}
                      type="color"
                      value={code.color}
                      onChange={(e) => handleColorChange(code.id, e.target.value)}
                      className="absolute opacity-0 w-0 h-0"
                    />
                  </div>
                  
                  <div className="flex-1">
                    {/* Editable name */}
                    {editingCodeId === code.id && editingField === 'name' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyPress}
                        className="font-semibold text-sm border rounded px-1 py-0.5 w-full"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="font-semibold text-sm cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                        onDoubleClick={() => startEditing(code.id, 'name', code.name)}
                        title="Double-click to edit"
                      >
                        {code.name}
                      </span>
                    )}
                    
                    {/* Editable description */}
                    {editingCodeId === code.id && editingField === 'description' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyPress}
                        className="text-sm text-gray-600 border rounded px-1 py-0.5 w-full mt-0.5"
                        placeholder="Description (optional)"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded block"
                        onDoubleClick={() => startEditing(code.id, 'description', code.description || '')}
                        title="Double-click to edit description"
                      >
                        {code.description ? `(${code.description})` : '(click to add description)'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <button
                    onClick={() => handleDeleteCode(code.id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                    title="Delete code"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
            
            {/* Show no results message when searching */}
            {getFilteredCodes().length === 0 && searchTerm.trim() && (
              <li className="p-4 text-center text-gray-500 text-sm">
                No codes match your search "{searchTerm}"
              </li>
            )}
            
            {/* Add new code section - only show when not searching */}
            {!searchTerm.trim() && (
              <>
                {addingNew ? (
                  <li className="flex items-center justify-between p-2 bg-blue-50 rounded shadow-sm border-2 border-dashed border-blue-300">
                    <div className="flex items-center flex-1">
                      {/* Color picker for new code */}
                      <div className="relative mr-2">
                        <span
                          className="inline-block w-4 h-4 rounded-full cursor-pointer border border-gray-300 hover:border-gray-500"
                          style={{ 
                            backgroundColor: getNewCodePreviewColor()
                          }}
                          onClick={() => document.getElementById('new-color').click()}
                          title={newCode.color ? "Custom color selected - click to change" : "Auto-assigned color - click to customize"}
                        ></span>
                        <input
                          id="new-color"
                          type="color"
                          value={getNewCodePreviewColor()}
                          onChange={(e) => setNewCode({ ...newCode, color: e.target.value })}
                          className="absolute opacity-0 w-0 h-0"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center mb-0.5">
                          {/* Name input */}
                          <input
                            type="text"
                            value={newCode.name}
                            onChange={(e) => setNewCode({ ...newCode, name: e.target.value })}
                            onKeyDown={handleKeyPress}
                            className="font-semibold text-sm border rounded px-1 py-0.5 flex-1"
                            placeholder="Code name"
                            autoFocus
                          />
                          {/* Reset to auto color button */}
                          {newCode.color && (
                            <button
                              onClick={() => setNewCode({ ...newCode, color: null })}
                              className="ml-1 text-xs text-blue-600 hover:text-blue-800"
                              title="Use auto-assigned color"
                            >
                              Auto
                            </button>
                          )}
                        </div>
                        {/* Description input */}
                        <input
                          type="text"
                          value={newCode.description}
                          onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                          onKeyDown={handleKeyPress}
                          className="text-sm text-gray-600 border rounded px-1 py-0.5 w-full"
                          placeholder="Description (optional)"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={handleAddNewCode}
                        className="text-green-600 hover:text-green-800 text-sm"
                        title="Save code"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelAddNew}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Cancel"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ) : (
                  <li 
                    className="flex items-center p-2 bg-white rounded shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => setAddingNew(true)}
                  >
                    <div className="flex items-center flex-1 text-gray-500 hover:text-blue-600">
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-dashed border-gray-400 mr-2"></span>
                      <span className="text-sm">+ Add new code (auto color)</span>
                    </div>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CodeManager;
