import React, { useState, useEffect, createContext } from 'react';
import { loadProject, saveProject } from './lib/localStorageService';
import { Project } from './lib/models';
import { ColorGenerator } from './lib/colorGenerator';
import CodeManager from './lib/components/CodeManager';
import DocumentDisplay from './lib/components/DocumentDisplay';
import SegmentManager from './lib/components/SegmentManager';

export const ProjectContext = createContext(null);

function App() {
  const [project, setProject] = useState(() => {
    const loadedProject = loadProject();
    const proj = loadedProject instanceof Project ? loadedProject : new Project();
    
    // Initialize color tracking for existing codes
    ColorGenerator.initializeFromExistingCodes(proj.codes);
    
    return proj;
  });

  useEffect(() => {
    saveProject(project);
  }, [project]);

  const updateProject = (newProject) => {
    setProject(newProject);
  };

  const handleClearAll = () => {
    const hasData = project.codes.length > 0 || project.codedSegments.length > 0;
    
    if (hasData) {
      const confirmMessage = `This will delete all data:\n• ${project.codes.length} codes\n• ${project.codedSegments.length} segments\n\nThis action cannot be undone. Are you sure?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }
    
    // Reset to empty project
    const newProject = new Project();
    ColorGenerator.initializeFromExistingCodes([]);
    setProject(newProject);
    
    // Clear localStorage to ensure a completely fresh start
    saveProject(newProject);
  };

  return (
    <ProjectContext.Provider value={{ project, updateProject }}>
      <div className="h-screen bg-gray-100 p-1 overflow-hidden flex flex-col">
        <header className="bg-blue-700 text-white rounded shadow mb-2 px-3 py-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Qualitative Coding App</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 transition-colors"
              title="Clear all codes and segments"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
              </svg>
              <span>Clear All</span>
            </button>
            <button
              onClick={() => {
                // Create CSV content
                const headers = ['Segment Text', 'Assigned Codes'];
                const rows = project.codedSegments.map(segment => {
                  const assignedCodes = (segment.codeIds || []).map(codeId => {
                    const code = project.codes.find(c => c.id === codeId);
                    return code ? code.name : 'Unknown';
                  });
                  return [
                    `"${segment.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
                    `"${assignedCodes.join(', ')}"`
                  ];
                });
                
                const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'coded-segments.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 transition-colors"
              disabled={project.codedSegments.length === 0}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                <path d="M12,17L8,13H10.5V10H13.5V13H16L12,17Z" />
              </svg>
              <span>Download CSV</span>
            </button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 flex-1 min-h-0">
          <div className="md:col-span-1 bg-white p-1 rounded shadow-sm flex flex-col min-h-0">
            <DocumentDisplay />
          </div>
          <div className="md:col-span-1 bg-white p-1 rounded shadow-sm flex flex-col min-h-0">
            <SegmentManager />
          </div>
          <div className="md:col-span-1 bg-white p-1 rounded shadow-sm flex flex-col min-h-0">
            <CodeManager />
          </div>
        </div>
      </div>
    </ProjectContext.Provider>
  );
}

export default App;