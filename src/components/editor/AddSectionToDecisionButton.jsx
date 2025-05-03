import { useState, useEffect } from 'react';
import { sectionDecisionStorage } from '../../utils/sectionDecisionStorage';
import clsx from 'clsx';
import { HiPlus, HiCheck, HiMinus } from 'react-icons/hi';
import { toast } from 'react-toastify';

/**
 * AddSectionToDecisionButton Component
 * @param {Object} props
 * @param {string} props.postId - The post identifier
 * @param {string} props.sectionFk - The section foreign key
 * @param {string} props.sectionTitle - The section title
 * @param {Object} props.sectionContent - The section content (HTML or block data)
 * @param {Object} props.postData - Additional post data (title, etc)
 * @returns {ReactComponent} Button that toggles section in decisions
 */
export default function AddSectionToDecisionButton({ postId, sectionFk, sectionTitle, sectionContent, postData = {} }) {
  const [isAdded, setIsAdded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sectionId, setSectionId] = useState(null);
  
  // Check if the section is already in decisions
  useEffect(() => {
    const sections = sectionDecisionStorage.getAll().sections;
    const existingSection = sections.find(
      item => item.post_id === postId && item.section_data.section_fk === sectionFk
    );
    
    if (existingSection) {
      setIsAdded(true);
      setSectionId(existingSection.id);
    } else {
      setIsAdded(false);
      setSectionId(null);
    }
  }, [postId, sectionFk]);
  
  const handleToggleSection = () => {
    setIsProcessing(true);
    
    try {
      if (isAdded && sectionId) {
        // Remove section
        const result = sectionDecisionStorage.remove(sectionId);
        
        if (result.status === 'success') {
          setIsAdded(false);
          setSectionId(null);
          toast.success('Section removed from decisions');
        } else {
          toast.error(result.message);
        }
      } else {
        // Add section
        const result = sectionDecisionStorage.add(
          postId, 
          sectionFk, 
          sectionTitle, 
          sectionContent, 
          postData
        );
        
        if (result.status === 'success') {
          setIsAdded(true);
          setSectionId(result.section.id);
          toast.success('Section added to decisions');
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error('Error toggling section decision:', error);
      toast.error('Failed to process section decision');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleToggleSection}
      disabled={isProcessing}
      className={clsx(
        "inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
        isAdded 
          ? "bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800"
          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
      )}
    >
      {isProcessing ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : isAdded ? (
        <>
          <HiMinus className="h-4 w-4" />
          <span>Remove</span>
        </>
      ) : (
        <>
          <HiPlus className="h-4 w-4" />
          <span>Add Section</span>
        </>
      )}
    </button>
  );
} 