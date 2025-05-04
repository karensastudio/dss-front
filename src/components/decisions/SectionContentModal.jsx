import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import parse from 'html-react-parser';

export default function SectionContentModal({ isOpen, onClose, section }) {
  if (!section) return null;
  
  // Helper function to render section content
  const renderContent = () => {
    if (!section.section_data.section_content) return null;
    
    if (typeof section.section_data.section_content === 'string') {
      return <div className="text-base">{parse(section.section_data.section_content)}</div>;
    }
    
    if (Array.isArray(section.section_data.section_content)) {
      return (
        <div className="text-[16px] leading-[24px] text-[#444444]">
          {section.section_data.section_content.map((block, index) => {
            try {
              if (block.type === "paragraph")
                return <div key={index} className="mb-3">{parse(block.data?.text || '')}</div>;
              
              if (block.type === "header")
                return <div key={index} className="mb-3 font-bold">{parse(block.data?.text || '')}</div>;
              
              if (block.type === "list")
                return (
                  <div key={index} className="mb-3">
                    <ul className="list-decimal list-inside pl-5">
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

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                      {section.section_data.section_title}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mb-4">
                      From: {section.post?.title || 'Unknown Post'}
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-[70vh] overflow-y-auto">
                      {renderContent()}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 