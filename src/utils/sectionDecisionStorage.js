/**
 * Section Decision Storage Utilities
 * This module provides utilities for storing section decisions in localStorage
 */

// Storage key for section decisions
const STORAGE_KEY = 'section_decisions';

// Error states
export const errorStates = {
  STORAGE_FULL: "Maximum storage limit reached",
  ALREADY_ADDED: "Section already in decisions",
  INVALID_DATA: "Invalid section data",
  PARSE_ERROR: "Failed to parse section content",
};

/**
 * Adds a section to the decisions list
 * @param {string} postId - The post identifier
 * @param {string} sectionFk - The section foreign key
 * @param {string} sectionTitle - The section title
 * @param {Object} postData - Additional post data (title, etc)
 * @returns {Object} Status and message
 */
const add = (postId, sectionFk, sectionTitle, sectionContent, postData = {}) => {
  try {
    const existingData = getAll().sections;
    
    // Check if section already exists
    const existingSection = existingData.find(
      item => item.post_id === postId && item.section_data.section_fk === sectionFk
    );
    
    if (existingSection) {
      return {
        status: 'error',
        message: errorStates.ALREADY_ADDED
      };
    }
    
    // Create new section decision
    const newSection = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      post_id: postId,
      section_data: {
        section_fk: sectionFk,
        section_title: sectionTitle,
        section_content: sectionContent
      },
      post: postData,
      created_at: new Date().toISOString(),
    };
    
    // Add to existing data
    const updatedData = [...existingData, newSection];
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    return {
      status: 'success',
      message: 'Section added to decisions',
      section: newSection
    };
  } catch (error) {
    console.error('Error adding section decision:', error);
    return {
      status: 'error',
      message: error.message || errorStates.INVALID_DATA
    };
  }
};

/**
 * Gets all section decisions
 * @returns {Object} Status and sections array
 */
const getAll = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const sections = data ? JSON.parse(data) : [];
    
    return {
      status: 'success',
      sections
    };
  } catch (error) {
    console.error('Error getting section decisions:', error);
    return {
      status: 'error',
      message: error.message || errorStates.PARSE_ERROR,
      sections: []
    };
  }
};

/**
 * Removes a section decision by id
 * @param {string} id - The section decision id
 * @returns {Object} Status and message
 */
const remove = (id) => {
  try {
    const { sections } = getAll();
    const updatedSections = sections.filter(section => section.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSections));
    
    return {
      status: 'success',
      message: 'Section removed from decisions'
    };
  } catch (error) {
    console.error('Error removing section decision:', error);
    return {
      status: 'error',
      message: error.message || 'Failed to remove section'
    };
  }
};

/**
 * Clears all section decisions
 * @returns {Object} Status and message
 */
const clear = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    return {
      status: 'success',
      message: 'All section decisions cleared'
    };
  } catch (error) {
    console.error('Error clearing section decisions:', error);
    return {
      status: 'error',
      message: error.message || 'Failed to clear sections'
    };
  }
};

/**
 * Checks if a section is in decisions
 * @param {string} postId - The post identifier
 * @param {string} sectionFk - The section foreign key
 * @returns {boolean} Whether the section is in decisions
 */
const isInDecisions = (postId, sectionFk) => {
  const { sections } = getAll();
  
  return sections.some(
    item => item.post_id === postId && item.section_data.section_fk === sectionFk
  );
};

// Export the utility functions
export const sectionDecisionStorage = {
  add,
  getAll,
  remove,
  clear,
  isInDecisions
};

export default sectionDecisionStorage; 