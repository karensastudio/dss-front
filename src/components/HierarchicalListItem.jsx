import { Disclosure, Transition } from "@headlessui/react";
import { useState } from "react";
import { BsFileEarmark } from "react-icons/bs";
import { HiOutlineDocument, HiOutlineDocumentText, HiOutlineFolder, HiOutlineFolderOpen } from "react-icons/hi";
import { useRecoilState } from "recoil";
import { SinglePostState } from "../states";
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from "clsx";
import * as d3 from 'd3';

// Get color from section tag for consistency with graph visualization
const getSectionColor = (post) => {
  const sectionTag = post.tags?.find(tag => tag.name.startsWith('Section'));
  if (sectionTag) {
    // Use a consistent color scheme that matches the d3 color scale in the Graph component
    const colors = d3.schemeSet3;
    // Create a simple hash function for the section name to get a consistent color
    const hash = sectionTag.name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  }
  return "#9ca3af"; // Default gray
};

// Enhanced version of SingleListDisclosure with better hierarchy visualization
export function HierarchicalListItem(props) {
  const { post, PostChanger, depth = 0 } = props;
  const [singlePost] = useRecoilState(SinglePostState);
  const isCurrentPost = singlePost?.id === post.id;
  const hasChildren = post.children && post.children.length > 0;
  const sectionColor = getSectionColor(post);
  
  // Determine which icon to use based on depth and if it has children
  const getIcon = () => {
    if (depth === 0) {
      return hasChildren ? 
        <HiOutlineFolderOpen className="w-5 h-5" /> : 
        <HiOutlineFolder className="w-5 h-5" />;
    } else if (depth === 1) {
      return hasChildren ?
        <HiOutlineDocumentText className="w-4 h-4" /> :
        <HiOutlineDocument className="w-4 h-4" />;
    } else {
      return <BsFileEarmark className="w-3 h-3" />;
    }
  };

  return (
    <li key={post.id} className={`relative ${depth > 0 ? 'ml-3' : ''}`}>
      {/* Add connecting line for children */}
      {depth > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" 
          style={{ left: '0.5rem' }}
        />
      )}
      
      <Disclosure defaultOpen={depth === 0}>
        {({ open }) => {
          return (
            <>
              <Disclosure.Button
                className={clsx(
                  "group transition-all w-full text-start relative flex justify-between items-center cursor-pointer",
                  "rounded-md my-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200",
                  "py-2 pl-3 pr-2",
                  depth === 0 ? "font-semibold text-gray-800" : "",
                  isCurrentPost ? "bg-blue-50" : ""
                )}
                style={{
                  paddingLeft: `${depth * 12 + 12}px`,
                  borderLeft: isCurrentPost ? `4px solid ${sectionColor}` : "4px solid transparent"
                }}
                onClick={(e) => {
                  // If clicking on the main section, navigate to it
                  PostChanger(post.slug);
                  // If it has children, let the disclosure handle expand/collapse
                  // We don't prevent default to allow the disclosure to work
                }}
              >
                <div className="flex min-w-0 gap-x-3 items-center">
                  {/* Icon based on depth and type */}
                  <div className={clsx(
                    "flex-shrink-0",
                    post.is_decision ? "text-amber-500" : depth === 0 ? "text-blue-600" : "text-gray-500"
                  )}>
                    {getIcon()}
                  </div>
                  
                  <div className="min-w-0 flex-auto">
                    <p className={clsx(
                      "text-sm leading-6 truncate",
                      depth === 0 ? "font-semibold" : "",
                      isCurrentPost ? "text-blue-700" : "text-gray-900"
                    )}>
                      {post.title}
                    </p>
                    
                    {depth === 0 && post.children.length > 0 && (
                      <p className="mt-1 flex text-xs leading-5 text-gray-500">
                        <span className="relative truncate">
                          {post.children.length} Post{post.children.length !== 1 ? 's' : ''}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                
                {hasChildren && (
                  <div className={clsx(
                    "flex shrink-0 items-center justify-center rounded-full transition-all",
                    "w-6 h-6 bg-gray-50 group-hover:bg-gray-100",
                    open ? "" : ""
                  )}>
                    {open ? (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    )}
                  </div>
                )}
              </Disclosure.Button>
              
              <Transition
                enter="transition duration-150 ease-out overflow-hidden"
                enterFrom="transform origin-top scale-y-95 opacity-0"
                enterTo="transform origin-top scale-y-100 opacity-100"
                leave="transition duration-100 ease-out overflow-hidden"
                leaveFrom="transform origin-top scale-y-100 opacity-100"
                leaveTo="transform origin-top scale-y-95 opacity-0"
              >
                <Disclosure.Panel static className="relative">
                  <ul role="list" className="mt-1">
                    {/* Child items */}
                    {post.children.length > 0 && post.children.map((subPost) => {
                      if (subPost.children.length > 0) {
                        return <HierarchicalListItem 
                          post={subPost} 
                          PostChanger={PostChanger} 
                          depth={depth + 1}
                          key={subPost.id}
                        />;
                      } else {
                        return (
                          <li
                            key={subPost.id}
                            className={clsx(
                              "cursor-pointer relative flex items-center ml-3",
                              "hover:bg-gray-50 rounded-md my-1",
                              singlePost?.id === subPost.id ? "bg-blue-50" : ""
                            )}
                            style={{
                              paddingLeft: `${(depth + 1) * 12 + 12}px`,
                              borderLeft: singlePost?.id === subPost.id ? `4px solid ${sectionColor}` : "4px solid transparent"
                            }}
                            onClick={() => PostChanger(subPost.slug)}
                          >
                            {/* The horizontal connecting line */}
                            <div 
                              className="absolute w-3 h-px bg-gray-200"
                              style={{ left: '0.5rem', top: '50%' }}
                            />
                            
                            <div 
                              className="py-2 flex gap-x-3 items-center w-full"
                            >
                              <div className={clsx(
                                "text-gray-500",
                                subPost.is_decision ? "text-amber-500" : ""
                              )}>
                                <BsFileEarmark className="w-3 h-3" />
                              </div>
                              <p
                                className={clsx(
                                  "text-sm truncate",
                                  singlePost?.id === subPost.id ? "text-blue-700 font-medium" : "text-gray-700"
                                )}
                              >
                                {subPost.title}
                              </p>
                            </div>
                          </li>
                        );
                      }
                    })}
                  </ul>
                </Disclosure.Panel>
              </Transition>
            </>
          );
        }}
      </Disclosure>
    </li>
  );
}