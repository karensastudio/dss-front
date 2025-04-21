import { useEffect, useState, useRef } from "react";
import { useAuthHeader } from "react-auth-kit";
import { getPostBySlugApi } from "../../../api/userPost";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CgSpinner } from "react-icons/cg"; // Note: This import is present but not used in the provided code.
import parse from 'html-react-parser';
import ParagraphComponent from "../../editor/ParagraphComponent";
import HeadingComponentV2 from "../../editor/HeadingComponentV2";
import ImageComponent from "../../editor/ImageComponent";
import LinkComponent from "../../editor/LinkComponent";
import TableComponent from "../../editor/TableComponent";
import ToggleComponent from "../../editor/ToggleComponent";

const QuickViewPane = ({ slug, onClose, isOpen, onNodeClick }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postDataJSON, setPostDataJSON] = useState(null);
  const authHeader = useAuthHeader();
  const paneRef = useRef(null);
  const isMounted = useRef(true);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paneRef.current && !paneRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]); // onClose is a prop, assuming it's stable

  // Handle ESC key press to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]); // onClose is a prop, assuming it's stable

  // Set up mounted ref for cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // Define fetchPostData outside the effect so it can be called from click handlers
  const fetchPostData = async (postSlug) => {
      if (!postSlug || !isMounted.current) return;

      setLoading(true);
      setError(null);
      setPost(null); // Clear previous post data when fetching new one
      setPostDataJSON(null); // Clear previous JSON data

      try {
        console.log(`Fetching post data for slug: ${postSlug}`);

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Fetch timed out');
          abortController.abort();
        }, 10000); // 10 second timeout

        const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/posts/${postSlug}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': authHeader() // Use authHeader() here
          },
          signal: abortController.signal
        });

        clearTimeout(timeoutId);

        if (!isMounted.current) {
          console.log('Component unmounted during fetch, aborting state updates');
          return;
        }

        if (!response.ok) {
          // Attempt to read error message from body if available
          const errorBody = await response.json().catch(() => null);
          const errorMessage = errorBody?.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.status === 'success' && data.post) {
          console.log('Post data received successfully');
          setPost(data.post);

          try {
            console.log('Parsing post description');
            let tmpPostDataJSON = JSON.parse(data.post.description);
            console.log('Post description parsed');

            // Process toggle blocks
            if (tmpPostDataJSON && tmpPostDataJSON.blocks) {
              console.log('Processing toggle blocks');
              const processedBlocks = [];
              let i = 0;
              while (i < tmpPostDataJSON.blocks.length) {
                const block = tmpPostDataJSON.blocks[i];
                 // Ensure block and block.data exist before accessing properties
                if (block?.type === "toggle" && block.data) {
                  const itemsCount = block.data.items || 0;
                  // Ensure we don't slice beyond the array bounds
                  const TMPToggleChilds = tmpPostDataJSON.blocks.slice(i + 1, Math.min(i + 1 + itemsCount, tmpPostDataJSON.blocks.length));
                  block.data.children = TMPToggleChilds;
                  processedBlocks.push(block);
                  // Skip the children blocks in the main loop
                  i += itemsCount + 1;
                } else {
                   // Push the block if it's not a toggle or is malformed
                  if(block) processedBlocks.push(block);
                  i++;
                }
              }
              tmpPostDataJSON.blocks = processedBlocks; // Replace original blocks with processed ones
            }

            setPostDataJSON(tmpPostDataJSON);
          } catch (parseError) {
            console.error('Error parsing post description:', parseError);
            setError('Error parsing post content');
            setPostDataJSON(null); // Ensure JSON data is null on parse error
          }
        } else {
          console.error('API returned error or no post data:', data);
          setError(data.message || 'Failed to load post');
        }
      } catch (error) {
        if (!isMounted.current) {
           console.log('Component unmounted during error handling');
           return;
        }

        console.error('Error fetching post:', error);

        // Check for AbortError (timeout or unmount during fetch)
        if (error.name === 'AbortError') {
             console.log('Fetch aborted');
             // Optionally set a specific message for timeout/abort
             setError('Request timed out or was cancelled.');
        } else if (error.message.includes('HTTP error! status: 429')) { // Check message for status
          setError('Too many requests. Please try again later.');
        } else {
          setError('An error occurred while loading the post');
        }
        setPost(null); // Clear post data on error
        setPostDataJSON(null); // Clear JSON data on error
      } finally {
        if (isMounted.current) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

  // Fetch post data when slug or isOpen changes
  useEffect(() => {
    // Only fetch if the pane is open and a slug is provided
    if (isOpen && slug) {
      fetchPostData(slug);
    } else {
      // Reset state when pane is closed or slug is cleared
      setPost(null);
      setPostDataJSON(null);
      setLoading(true); // Set loading back to true so it shows spinner next time it opens
      setError(null);
    }

    // Cleanup function for the effect
    return () => {
      // If fetchPostData used AbortController, you could abort here,
      // but the AbortController is local to the function call,
      // and the `isMounted` ref handles preventing state updates.
      // No specific cleanup needed for this fetch pattern beyond `isMounted`.
    };

  }, [slug, isOpen]); // Effect depends on slug and isOpen

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-gray-500 bg-opacity-25 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
        <div
          className={`pointer-events-auto w-screen max-w-md transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          ref={paneRef}
        >
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                {loading ? (
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
                    {post?.title || 'Post Details'}
                  </h2>
                )}
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {/* View Full Post Button */}
              {post && (
                <a 
                  href={`/posts/${post.slug}`}
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full Post
                </a>
              )}
            </div>

            {/* Content */}
            <div className="relative flex-1 px-4 py-5">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <div className="text-red-500 mb-2">Error loading post</div>
                  <p className="text-gray-500">{error}</p>
                </div>
              ) : (
                <div className="text-editor text-[16px] leading-[24px] text-[#444444]">
                  {/* Debug info */}
                  {/* <div className="mb-4 p-3 bg-gray-100 rounded-md">
                    <p><strong>Debug info:</strong></p>
                    <p>Post ID: {post?.id || 'Not available'}</p>
                    <p>Post Title: {post?.title || 'Not available'}</p>
                    <p>Has Post Data: {post ? 'Yes' : 'No'}</p>
                    <p>Has JSON Data: {postDataJSON ? 'Yes' : 'No'}</p>
                    <p>Blocks Count: {postDataJSON?.blocks?.length || 0}</p>
                  </div> */}

                  {/* Tags */}
                  {post?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content blocks */}
                  {postDataJSON && postDataJSON.blocks && postDataJSON.blocks.length > 0 ?
                    postDataJSON.blocks.map((block, index) => {
                      try {
                        // Added checks for block and block.type existence
                        if (!block) return <div key={`empty-${index}`}>Empty block at index {index}</div>;
                        if (!block.type) return <div key={`notype-${index}`}>Block at index {index} missing type</div>;

                        if (block.type === "paragraph")
                          return <ParagraphComponent key={block.id || `para-${index}`} block={block} />;
                        if (block.type === "header")
                          return (
                            <div key={block.id || `header-${index}`} className="mb-3">
                              <HeadingComponentV2 element={block} />
                            </div>
                          );
                        if (block.type === "Image")
                          return <ImageComponent key={block.id || `img-${index}`} element={block} />;
                        if (block.type === "raw")
                          return (
                            <div
                              key={block.id || `raw-${index}`}
                              className="w-full rounded-[12px] mb-3"
                              dangerouslySetInnerHTML={{ __html: block.data?.html || '' }}
                            ></div>
                          );
                        if (block.type === "linkTool")
                          return <LinkComponent key={block.id || `link-${index}`} block={block} />;
                        if (block.type === "warning")
                          return (
                            <div
                              key={block.id || `warn-${index}`}
                              className="w-full rounded-[12px] bg-gray-500 bg-opacity-10 text-gray-700 p-4 mb-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div>
                                    <span className="text-[16px] leading-[20px] font-semibold">
                                      {block.data?.title ? parse(block.data.title) : 'Warning'}
                                    </span>
                                    <p className="text-[14px]">
                                      {block.data?.message ? parse(block.data.message) : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        if (block.type === "list")
                          return (
                            <div key={block.id || `list-${index}`} className="w-full rounded-[12px] mb-3">
                              <ul className="list-decimal list-inside pl-5">
                                {block.data?.items?.map((item, itemIndex) => (
                                  <li className="mb-3 text-justify" key={itemIndex}>
                                    {parse(item)}
                                  </li>
                                )) || <li>No items</li>}
                              </ul>
                            </div>
                          );
                        if (block.type === "table")
                          return <TableComponent key={block.id || `table-${index}`} block={block} />;
                        if (block.type === "toggle")
                          return <ToggleComponent key={block.id || `toggle-${index}`} block={block} />;

                        return <div key={`unknown-${index}`}>Unknown block type: {block.type} at index {index}</div>;
                      } catch (error) {
                        console.error(`Error rendering block ${index}:`, error, block);
                        return (
                          <div key={`error-${index}`} className="p-2 bg-red-50 text-red-500 rounded mb-2">
                            Error rendering block {index}: {error.message}
                          </div>
                        );
                      }
                    }) :
                    <div className="p-4 bg-yellow-50 rounded-md">
                      <p className="text-yellow-700 font-medium">No content blocks found</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        {postDataJSON ?
                          (postDataJSON.blocks ?
                            'Post has empty blocks array' :
                            'Post description is missing blocks property') :
                          'Post description could not be parsed'}
                      </p>
                    </div>
                  }

                  {/* Related Posts */}
                  {post?.related?.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">
                        Related Posts
                      </h3>
                      <div className="space-y-3">
                        {post.related.map(relatedPost => (
                          <div
                            key={relatedPost.id}
                            className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                            // This onClick handler needs to trigger a change in the 'slug' prop
                            // passed to QuickViewPane from its parent component.
                            // Directly calling fetchPostData here bypasses the useEffect
                            // and won't update the 'slug' prop which the useEffect depends on.
                            // The parent component should handle updating the slug prop.
                            // For demonstration, we'll log the slug.
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Clicked related post:", relatedPost.slug);
                              
                              // Skip if there's no slug or onNodeClick function
                              if (!relatedPost.slug || typeof onNodeClick !== 'function') {
                                console.warn("Missing slug or onNodeClick function");
                                return;
                              }
                              
                              // Use history.replaceState to update the URL without a page refresh
                              window.history.replaceState(null, '', `/posts/${relatedPost.slug}`);
                              
                              // This is a simpler approach - directly fetch the new post's data
                              console.log("Directly fetching post data for related post");
                              fetchPostData(relatedPost.slug);
                            }}
                          >
                            <div className="flex-1 truncate">
                              <div className="font-medium text-gray-900 truncate">
                                {relatedPost.title}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                   {/* Note: The onClick handler for related posts currently just logs.
                       To make it load the related post, the parent component needs
                       to provide a callback prop (e.g., onRelatedPostClick) that
                       updates the 'slug' prop passed to QuickViewPane.
                       Alternatively, QuickViewPane could manage the current slug
                       internally using useState, initialized by the prop, and
                       update that internal state here. */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewPane;