import { BsTrash3, BsEye, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { sectionDecisionStorage } from '../../utils/sectionDecisionStorage';
import { toast } from 'react-toastify';
import { useState } from 'react';
import clsx from 'clsx';

export default function SectionDecisionCard({ section, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  
  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  // Helper function to get content preview
  const getContentPreview = () => {
    if (!section.section_data.section_content) return null;
    
    if (typeof section.section_data.section_content === 'string') {
      // Strip HTML and get plain text
      const plainText = section.section_data.section_content.replace(/<[^>]*>/g, ' ');
      return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
    }
    
    // For arrays (paragraphs, etc.)
    if (Array.isArray(section.section_data.section_content)) {
      // Look for the first paragraph with actual text
      const firstParagraph = section.section_data.section_content.find(
        item => item.type === "paragraph" && item.data?.text
      );
      
      if (firstParagraph) {
        const plainText = firstParagraph.data.text.replace(/<[^>]*>/g, ' ');
        return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
      }
    }
    
    // For objects (toggle content)
    if (section.section_data.section_content.data?.children?.length) {
      return 'Toggle section with content';
    }
    
    return 'Section content';
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {section.section_data.section_title}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              From: {section.post?.title || 'Unknown Post'}
            </p>
            {section.section_data.section_content && (
              <div className="relative">
                <div className={clsx(
                  "text-xs text-gray-700 mt-2 bg-gray-50 p-2 rounded-md overflow-hidden transition-all",
                  isExpanded ? "max-h-96" : "max-h-16"
                )}>
                  {isExpanded ? (
                    typeof section.section_data.section_content === 'string' ? (
                      <div dangerouslySetInnerHTML={{ __html: section.section_data.section_content }}></div>
                    ) : Array.isArray(section.section_data.section_content) ? (
                      <div>
                        {section.section_data.section_content.map((block, index) => {
                          if (block.type === "paragraph")
                            return <div key={index} className="mb-3 text-sm" dangerouslySetInnerHTML={{ __html: block.data?.text || '' }}></div>;
                          if (block.type === "header")
                            return <div key={index} className="mb-3 font-bold text-sm" dangerouslySetInnerHTML={{ __html: block.data?.text || '' }}></div>;
                          if (block.type === "list")
                            return (
                              <div key={index} className="mb-3">
                                <ul className="list-disc list-inside ml-4 text-sm">
                                  {block.data?.items?.map((item, itemIndex) => (
                                    <li key={itemIndex} className="mb-1" dangerouslySetInnerHTML={{ __html: item }}></li>
                                  ))}
                                </ul>
                              </div>
                            );
                          return null;
                        })}
                      </div>
                    ) : section.section_data.section_content.data?.children ? (
                      <div>
                        {section.section_data.section_content.data.children.map((subBlock, index) => {
                          if (subBlock.type === "paragraph")
                            return <div key={index} className="mb-3 text-sm" dangerouslySetInnerHTML={{ __html: subBlock.data?.text || '' }}></div>;
                          if (subBlock.type === "header")
                            return <div key={index} className="mb-3 font-bold text-sm" dangerouslySetInnerHTML={{ __html: subBlock.data?.text || '' }}></div>;
                          if (subBlock.type === "list")
                            return (
                              <div key={index} className="mb-3">
                                <ul className="list-disc list-inside ml-4 text-sm">
                                  {subBlock.data?.items?.map((item, itemIndex) => (
                                    <li key={itemIndex} className="mb-1" dangerouslySetInnerHTML={{ __html: item }}></li>
                                  ))}
                                </ul>
                              </div>
                            );
                          return null;
                        })}
                      </div>
                    ) : (
                      <div className="line-clamp-2 text-sm">{getContentPreview()}</div>
                    )
                  ) : (
                    <div className="line-clamp-2 text-sm">{getContentPreview()}</div>
                  )}
                </div>
                {section.section_data.section_content && (
                  <button 
                    onClick={toggleExpand}
                    className="absolute bottom-1 right-1 p-1 bg-white rounded shadow-sm hover:bg-gray-100"
                  >
                    {isExpanded ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />}
                  </button>
                )}
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
      <div className="border-t border-gray-200">
        {console.log('Section post data:', section.post)}
        {section.post?.slug ? (
          <Link
            to={`/posts/${section.post.slug}`}
            className="block w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 text-center transition-colors"
          >
            View Post
          </Link>
        ) : (
          <span className="block w-full px-4 py-2 text-sm font-medium text-gray-400 text-center">
            Post Not Available
          </span>
        )}
      </div>
    </div>
  );
} 