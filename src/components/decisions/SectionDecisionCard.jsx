import { BsTrash3, BsEye } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { sectionDecisionStorage } from '../../utils/sectionDecisionStorage';
import { toast } from 'react-toastify';
import { useState } from 'react';
import SectionContentModal from './SectionContentModal';

export default function SectionDecisionCard({ section, onRemove }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = sectionDecisionStorage.remove(section.id);
      
      if (result.status === 'success') {
        toast.success('Section removed from decisions');
        if (onRemove) {
          onRemove(section.id);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error removing section decision:', error);
      toast.error('Failed to remove section from decisions');
    }
  };
  
  const openModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };
  
  // Get a preview for display
  const getContentPreview = () => {
    if (!section.section_data.section_content) return null;
    
    if (typeof section.section_data.section_content === 'string') {
      const plainText = section.section_data.section_content.replace(/<[^>]*>/g, ' ');
      return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
    }
    
    if (Array.isArray(section.section_data.section_content)) {
      const firstParagraph = section.section_data.section_content.find(
        item => item.type === "paragraph" && item.data?.text
      );
      
      if (firstParagraph) {
        const plainText = firstParagraph.data.text.replace(/<[^>]*>/g, ' ');
        return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
      }
    }
    
    return 'View section content';
  };
  
  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {section.section_data.section_title}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                From: {section.post?.title || 'Unknown Post'}
              </p>
              {section.section_data.section_content && (
                <div className="relative">
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md overflow-hidden px-4 py-3 max-h-16 overflow-hidden">
                    <div className="line-clamp-2 text-sm text-gray-700">{getContentPreview()}</div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleRemove}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove section"
            >
              <BsTrash3 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 flex">
          {section.post?.slug ? (
            <Link
              to={`/posts/${section.post.slug}`}
              className="block w-1/2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 text-center transition-colors border-r border-gray-200"
            >
              View Post
            </Link>
          ) : (
            <span className="block w-1/2 px-4 py-2 text-sm font-medium text-gray-400 text-center border-r border-gray-200">
              Post Not Available
            </span>
          )}
          <button
            onClick={openModal}
            className="block w-1/2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 text-center transition-colors flex items-center justify-center"
          >
            <BsEye className="mr-1 h-4 w-4" /> View Content
          </button>
        </div>
      </div>
      
      <SectionContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
      />
    </>
  );
} 