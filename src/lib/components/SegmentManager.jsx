import React, { useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../../App';
import CsvUpload from './CsvUpload';
import ApiKeySettings from './ApiKeySettings';
import { segmentMapperConfig } from '../csvMapperConfigs.js';
import { AutoCodingService } from '../autoCodingService.js';

function SegmentManager() {
  const { project, updateProject } = useContext(ProjectContext);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoCoding, setIsAutoCoding] = useState(false);
  const [autoCodeResults, setAutoCodeResults] = useState(null);
  const [apiKey, setApiKey] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicking outside any dropdown
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter codes based on search term
  const getFilteredCodes = () => {
    if (!searchTerm.trim()) return project.codes;
    return project.codes.filter(code => 
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.description && code.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleCodeToggle = (segmentId, codeId) => {
    const segment = project.codedSegments.find(s => s.id === segmentId);
    const currentCodes = segment.codeIds || [];
    
    let updatedCodes;
    if (currentCodes.includes(codeId)) {
      // Remove code if already assigned
      updatedCodes = currentCodes.filter(id => id !== codeId);
    } else {
      // Add code if not assigned
      updatedCodes = [...currentCodes, codeId];
    }

    const updatedSegments = project.codedSegments.map(segment => {
      if (segment.id === segmentId) {
        return { ...segment, codeIds: updatedCodes, codeId: updatedCodes[0] || null };
      }
      return segment;
    });

    updateProject({
      ...project,
      codedSegments: updatedSegments,
    });
  };

  const getAssignedCodeNames = (segment) => {
    const codes = segment.codeIds || [];
    if (codes.length === 0) return 'No codes assigned';
    return codes.map(codeId => {
      const code = project.codes.find(c => c.id === codeId);
      return code ? code.name : 'Unknown';
    }).join(', ');
  };

  const autoAssignCodes = async () => {
    if (project.codes.length === 0) {
      alert('Please create some codes first before using auto-assignment.');
      return;
    }

    if (project.codedSegments.length === 0) {
      alert('No segments available to code.');
      return;
    }

    setIsAutoCoding(true);
    setAutoCodeResults(null);

    try {
      // Use the auto-coding service with the API key
      const assignments = await AutoCodingService.assignCodes(project.codedSegments, project.codes, apiKey);

      // Apply the assignments
      const updatedSegments = project.codedSegments.map(segment => {
        const assignedCodeNames = assignments[segment.id] || [];
        const assignedCodeIds = assignedCodeNames
          .map(codeName => project.codes.find(code => code.name === codeName))
          .filter(code => code) // Remove null/undefined codes
          .map(code => code.id);

        return {
          ...segment,
          codeIds: assignedCodeIds,
          codeId: assignedCodeIds[0] || null
        };
      });

      updateProject({
        ...project,
        codedSegments: updatedSegments
      });

      setAutoCodeResults({
        totalSegments: project.codedSegments.length,
        codedSegments: updatedSegments.filter(s => s.codeIds && s.codeIds.length > 0).length,
        method: apiKey.trim() ? 'OpenAI' : 'Rule-based'
      });

    } catch (error) {
      console.error('Auto-coding error:', error);
      alert(`Auto-coding failed: ${error.message}`);
    } finally {
      setIsAutoCoding(false);
    }
  };

  return (
    <div className="p-0.5 bg-gray-50 text-xs flex flex-col h-full">
      <h2 className="text-base font-semibold mb-0.5">Segments</h2>
      
      <CsvUpload 
        config={segmentMapperConfig}
        label="Import Segments from CSV"
        description="Upload CSV file with text segments"
      />
      
      {/* API Key Settings */}
      <ApiKeySettings onApiKeyChange={setApiKey} />
      
      {/* Auto-coding section */}
      {project.codes.length > 0 && project.codedSegments.length > 0 && (
        <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-800">AI Auto-Coding</span>
            <button
              onClick={autoAssignCodes}
              disabled={isAutoCoding}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                isAutoCoding 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAutoCoding ? 'Processing...' : (apiKey.trim() ? 'Auto-Assign (AI)' : 'Auto-Assign (Basic)')}
            </button>
          </div>
          <p className="text-xs text-blue-600 mb-1">
            {apiKey.trim() 
              ? 'Using OpenAI GPT-3.5-turbo for intelligent code assignment.'
              : 'Using rule-based matching. Set an OpenAI API key for better results.'
            }
          </p>
          {autoCodeResults && (
            <div className="text-xs text-green-700 bg-green-50 p-1 rounded">
              ✓ Completed ({autoCodeResults.method}): {autoCodeResults.codedSegments} of {autoCodeResults.totalSegments} segments received codes
              {autoCodeResults.method === 'Rule-based' && (
                <div className="text-orange-600 mt-1">
                  ⚠️ Used keyword matching. For better AI analysis, add an OpenAI API key above.
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col flex-1 min-h-0">
        {project.codedSegments.length > 0 ? (
          <div className="bg-gray-50 rounded flex-1 min-h-0 overflow-y-auto p-1">
            {project.codedSegments.map(segment => (
              <div key={segment.id} className="mb-2 p-3 bg-white rounded shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-2">
                  <p className="text-sm whitespace-pre-wrap text-gray-800 leading-relaxed">
                    "{segment.text}"
                  </p>
                  {/* Display assigned codes as tags */}
                  {(segment.codeIds || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(segment.codeIds || []).map(codeId => {
                        const code = project.codes.find(c => c.id === codeId);
                        return code ? (
                          <span
                            key={codeId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: code.color }}
                          >
                            {code.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      const newDropdownState = openDropdown === segment.id ? null : segment.id;
                      setOpenDropdown(newDropdownState);
                      setSearchTerm(''); // Clear search when opening/closing dropdown
                    }}
                    className="w-full text-left text-sm p-2 border rounded bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                  >
                    <span className="truncate">{getAssignedCodeNames(segment)}</span>
                    <span className="ml-1 flex-shrink-0">
                      {openDropdown === segment.id ? '▲' : '▼'}
                    </span>
                  </button>
                  
                      {openDropdown === segment.id && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-40 flex flex-col">
                      {project.codes.length === 0 ? (
                        <div className="p-2 text-sm text-gray-600">
                          No codes available. Create some in "Manage Codes" section.
                        </div>
                      ) : (
                        <>
                          {/* Search bar */}
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search codes..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()} // Prevent dropdown close
                            />
                          </div>
                          {/* Codes list */}
                          <div className="overflow-y-auto max-h-32">
                            {getFilteredCodes().length === 0 ? (
                              <div className="p-2 text-sm text-gray-500">
                                No codes match your search.
                              </div>
                            ) : (
                              getFilteredCodes().map(code => {
                                const isAssigned = (segment.codeIds || []).includes(code.id);
                                return (
                                  <label
                                    key={code.id}
                                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isAssigned}
                                      onChange={() => handleCodeToggle(segment.id, code.id)}
                                      className="mr-2 w-4 h-4"
                                    />
                                    <span
                                      className="inline-block w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: code.color }}
                                    ></span>
                                    <span className="flex-1">{code.name}</span>
                                    {code.description && (
                                      <span className="text-gray-500 ml-1">({code.description})</span>
                                    )}
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600 text-sm">No segments created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SegmentManager;
