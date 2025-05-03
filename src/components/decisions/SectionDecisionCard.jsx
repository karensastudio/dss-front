import { BsTrash3, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { sectionDecisionStorage } from '../../utils/sectionDecisionStorage';
import { toast } from 'react-toastify';
import { useState } from 'react';
import clsx from 'clsx';
import parse from 'html-react-parser';

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
  
  // Helper function to render section content
  const renderContent = () => {
    if (!section.section_data.section_content) return null;
    
    if (typeof section.section_data.section_content === 'string') {
      return <div className="text-sm">{parse(section.section_data.section_content)}</div>;
    }
    
    if (Array.isArray(section.section_data.section_content)) {
      return (
        <div className="text-[16px] leading-[24px] text-[#444444]">
          {section.section_data.section_content.map((block, index) => {
            try {
              if (block.type === "paragraph")
                return <div key={index} className="mb-3 text-sm">{parse(block.data?.text || '')}</div>;
              
              if (block.type === "header")
                return <div key={index} className="mb-3 font-bold text-sm">{parse(block.data?.text || '')}</div>;
              
              if (block.type === "list")
                return (
                  <div key={index} className="mb-3">
                    <ul className="list-decimal list-inside pl-5 text-sm">
                      {block.data?.items?.map((item, itemIndex) => (
                        <li className="mb-3 text-justify" key={itemIndex}>
                          {parse(item)}
                        </li>
                      )) || <li>No items</li>}
                    </ul>
                  </div>
                );
              
              if (block.type === "code")
                return (
                  <div key={index} className="mb-3 bg-gray-100 p-3 rounded font-mono text-xs">
                    <pre>{block.data?.code || ''}</pre>
                  </div>
                );
              
              return null;
            } catch (error) {
              console.error(`Error rendering block ${index}:`, error);
              return null;
            }
          })}
        </div>
      );
    }
    
    return <div className="text-sm text-gray-600 italic">Content cannot be displayed</div>;
  };
  
  // Get a preview for collapsed view
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
                <div className={clsx(
                  "mt-2 bg-gray-50 border border-gray-200 rounded-md overflow-hidden transition-all px-4 py-3",
                  isExpanded ? "max-h-96 overflow-y-auto" : "max-h-16 overflow-hidden"
                )}>
                  {isExpanded ? (
                    renderContent()
                  ) : (
                    <div className="line-clamp-2 text-sm text-gray-700">{getContentPreview()}</div>
                  )}
                </div>
                {section.section_data.section_content && (
                  <button 
                    onClick={toggleExpand}
                    className="absolute bottom-1 right-1 p-1 bg-white rounded shadow-sm hover:bg-gray-100"
                    aria-label={isExpanded ? "Collapse content" : "Expand content"}
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