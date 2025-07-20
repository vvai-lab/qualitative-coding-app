// src/lib/localStorageService.js
import { Project } from './models';

const PROJECT_STORAGE_KEY = 'qualitativeCodingProject';

export const saveProject = (project) => {
  try {
    const serializedProject = JSON.stringify(project);
    localStorage.setItem(PROJECT_STORAGE_KEY, serializedProject);
  } catch (error) {
    console.error("Error saving project to localStorage:", error);
  }
};

export const loadProject = () => {
  try {
    const serializedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (serializedProject === null) {
      return new Project(); // Return a new, empty project if nothing is found
    }
    const projectData = JSON.parse(serializedProject);
    // Re-instantiate classes if necessary, though for simple data, direct use might be fine.
    // For now, assuming simple JSON objects are sufficient.
    return new Project(projectData);
  } catch (error) {
    console.error("Error loading project from localStorage:", error);
    return new Project(); // Return a new project in case of error
  }
};

export const clearProject = () => {
  try {
    localStorage.removeItem(PROJECT_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing project from localStorage:", error);
  }
};