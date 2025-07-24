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
  const [previewColor, setPreviewColor] = useState(null); // Fixed preview color for new code
  const [searchTerm, setSearchTerm] = useState('');

  // Get preview color for new code (either selected or fixed auto-assigned)
  const getNewCodePreviewColor = () => {
    return newCode.color || previewColor;
  };

  const handleAddNewCode = () => {
    if (newCode.name.trim() === '') return;
    const code = new Code({
      id: Date.now().toString(),
      name: newCode.name.trim(),
      description: newCode.description.trim(),
      inclusion: newCode.inclusion.trim(),
      exclusion: newCode.exclusion.trim(),
      color: newCode.color, // Use selected color or null for auto-assignment
      existingCodes: project.codes
    });
    updateProject({
      ...project,
      codes: [...project.codes, code],
    });
    setNewCode({ name: '', description: '', inclusion: '', exclusion: '', color: null });
    setPreviewColor(null); // Reset preview color
    setAddingNew(false);
  };

  const cancelAddNew = () => {
    setNewCode({ name: '', description: '', inclusion: '', exclusion: '', color: null });
    setPreviewColor(null); // Reset preview color
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
      (code.description && code.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (code.inclusion && code.inclusion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (code.exclusion && code.exclusion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Start adding new code with fixed preview color
  const startAddingNewCode = () => {
    setAddingNew(true);
    setPreviewColor(ColorGenerator.getColorForNewCode(project.codes));
  };

  return (
    <div className="p-0.5 bg-gray-50 text-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-0.5">
        <h2 className="text-base font-semibold">Codes</h2>
        {project.codes.length > 0 && (
          <div className="text-sm text-gray-600">
            {project.codes.length} {project.codes.length === 1 ? 'code' : 'codes'}
          </div>
        )}
      </div>

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
                          className="text-sm text-gray-600 border rounded px-1 py-0.5 w-full mb-0.5"
                          placeholder="Description (optional)"
                        />
                        {/* Inclusion criteria input */}
                        <input
                          type="text"
                          value={newCode.inclusion}
                          onChange={(e) => setNewCode({ ...newCode, inclusion: e.target.value })}
                          onKeyDown={handleKeyPress}
                          className="text-sm text-green-700 border rounded px-1 py-0.5 w-full mb-0.5"
                          placeholder="Inclusion criteria (optional)"
                        />
                        {/* Exclusion criteria input */}
                        <input
                          type="text"
                          value={newCode.exclusion}
                          onChange={(e) => setNewCode({ ...newCode, exclusion: e.target.value })}
                          onKeyDown={handleKeyPress}
                          className="text-sm text-red-700 border rounded px-1 py-0.5 w-full"
                          placeholder="Exclusion criteria (optional)"
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
                    onClick={startAddingNewCode}
                  >
                    <div className="flex items-center flex-1 text-gray-500 hover:text-blue-600">
                      <span className="inline-block w-4 h-4 rounded-full border-2 border-dashed border-gray-400 mr-2"></span>
                      <span className="text-sm">+ Add new code</span>
                    </div>
                  </li>
                )}
              </>
            )}

            {/* Show filtered codes */}
            {getFilteredCodes().map((code) => (
              <li
                key={code.id}
                className="group flex items-center justify-between p-2 bg-white rounded shadow-sm hover:shadow-md transition-shadow"
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
                    <div className="flex items-center justify-between">
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
                          className="font-semibold text-sm cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded flex-1"
                          onDoubleClick={() => startEditing(code.id, 'name', code.name)}
                          title="Double-click to edit"
                        >
                          {code.name}
                        </span>
                      )}
                      
                      {/* Add field dropdown for missing optional fields */}
                      {(!code.description || !code.inclusion || !code.exclusion) && (
                        <div className="relative group">
                          <button
                            className="text-gray-400 hover:text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            title="Add optional field"
                          >
                            +
                          </button>
                          <div className="absolute right-0 mt-1 py-1 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-max">
                            {!code.description && (
                              <button
                                onClick={() => startEditing(code.id, 'description', '')}
                                className="block px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                Add description
                              </button>
                            )}
                            {!code.inclusion && (
                              <button
                                onClick={() => startEditing(code.id, 'inclusion', '')}
                                className="block px-3 py-1 text-xs text-green-700 hover:bg-gray-100 w-full text-left"
                              >
                                Add inclusion criteria
                              </button>
                            )}
                            {!code.exclusion && (
                              <button
                                onClick={() => startEditing(code.id, 'exclusion', '')}
                                className="block px-3 py-1 text-xs text-red-700 hover:bg-gray-100 w-full text-left"
                              >
                                Add exclusion criteria
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Editable description - only show if has value or is being edited */}
                    {(editingCodeId === code.id && editingField === 'description') ? (
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
                    ) : code.description ? (
                      <span
                        className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded block"
                        onDoubleClick={() => startEditing(code.id, 'description', code.description || '')}
                        title="Double-click to edit description"
                      >
                        ({code.description})
                      </span>
                    ) : null}

                    {/* Editable inclusion criteria - only show if has value or is being edited */}
                    {(editingCodeId === code.id && editingField === 'inclusion') ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyPress}
                        className="text-sm text-green-700 border rounded px-1 py-0.5 w-full mt-0.5"
                        placeholder="Inclusion criteria (optional)"
                        autoFocus
                      />
                    ) : code.inclusion ? (
                      <span
                        className="text-sm text-green-700 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded block"
                        onDoubleClick={() => startEditing(code.id, 'inclusion', code.inclusion || '')}
                        title="Double-click to edit inclusion criteria"
                      >
                        Include: {code.inclusion}
                      </span>
                    ) : null}

                    {/* Editable exclusion criteria - only show if has value or is being edited */}
                    {(editingCodeId === code.id && editingField === 'exclusion') ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyPress}
                        className="text-sm text-red-700 border rounded px-1 py-0.5 w-full mt-0.5"
                        placeholder="Exclusion criteria (optional)"
                        autoFocus
                      />
                    ) : code.exclusion ? (
                      <span
                        className="text-sm text-red-700 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded block"
                        onDoubleClick={() => startEditing(code.id, 'exclusion', code.exclusion || '')}
                        title="Double-click to edit exclusion criteria"
                      >
                        Exclude: {code.exclusion}
                      </span>
                    ) : null}
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
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CodeManager;
