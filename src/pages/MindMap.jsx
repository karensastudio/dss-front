import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useRef, useState, useCallback } from "react";
import { HiMinus, HiPlus, HiZoomIn, HiZoomOut } from "react-icons/hi";
import { getUserGraphApi } from "../api/userPost";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import * as d3 from 'd3';
import { useNavigate } from "react-router-dom";
import { CgSpinner } from "react-icons/cg";
import MindMapRenderer, { RENDERERS } from "../components/mindmap/MindMapRenderer";

export default function MindMapPage() {
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  const [rootNodeId, setRootNodeId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  // Default to D3 renderer, but can be changed in the future
  const [renderer, setRenderer] = useState(RENDERERS.D3);

  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  
  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  
  const zoomStep = 0.2;

  // Handle zoom functionality
  const handleZoom = (zoomIn) => {
    if (!zoomRef.current) return;
    
    const svg = d3.select('#mindmap-svg');
    const currentTransform = d3.zoomTransform(svg.node());
    const newScale = zoomIn 
      ? currentTransform.k * (1 + zoomStep) 
      : currentTransform.k / (1 + zoomStep);
  
    svg.transition().duration(300).call(
      zoomRef.current.transform,
      currentTransform.scale(newScale / currentTransform.k)
    );
  };

  // Fetch user posts data from API
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getUserGraphApi(authHeader());
        if (response.status === 'success') {
          setUserPosts(response.response.posts);
          
          // Always find and use Tutorial as the root node, or first post if not found
          const tutorialPost = response.response.posts.find(p => p.title === 'Tutorial');
          if (tutorialPost) {
            setRootNodeId(tutorialPost.id);
            
            // Auto-expand ONLY the tutorial node initially
            const firstLevelNodePaths = new Set();
            // Add just the root node path
            firstLevelNodePaths.add(`${tutorialPost.id}`);
            
            setExpandedNodes(firstLevelNodePaths);
          } else if (response.response.posts.length > 0) {
            setRootNodeId(response.response.posts[0].id);
          }
          
          setError(null);
          setIsPostsLoading(false);
        } else {
          setError(response.message);
          setUserPosts([]);
          setIsPostsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setError('An unexpected error occurred.');
        setUserPosts([]);
        setIsPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // Get actual dimensions of the container element
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Add resize observer for more accurate size tracking
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Also listen for window resize as a fallback
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Handle node click
  const handleNodeClick = (slug) => {
    navigate(`/posts/${slug}`);
  };

  // Handle expanding/collapsing nodes
  const handleToggleExpand = (nodePath) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      return newSet;
    });
  };

  // Set zoom reference
  const setZoomReference = (zoom) => {
    zoomRef.current = zoom;
  };

  // No longer needed after removing the root node selection UI

  return (
    <UserLayout pageTitle={'MindMap'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-[16px] md:px-0">
          <div className="flex items-center justify-start gap-5">
            <div className="flex flex-col justify-center items-start py-3">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                MindMap Visualization
              </p>
              <p className="text-gray-500 text-xs">
                Hierarchical view of your content
              </p>
            </div>
          </div>

          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3 pl-5">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                Zoom:
              </p>
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => handleZoom(false)}
                >
                  <span className="sr-only">Zoom Out</span>
                  <HiZoomOut className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => handleZoom(true)}
                >
                  <span className="sr-only">Zoom In</span>
                  <HiZoomIn className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="bg-gray-50 h-full flex items-center justify-center min-h-[75vh] grow"
          id="mindmap-container"
          style={{ height: 'calc(100vh - 200px)' }} /* Explicit height calculation */
        >
          {isPostsLoading ? (
            <CgSpinner className="animate-spin text-[48px] text-blue-600" />
          ) : error ? (
            <p className="text-xl text-blue-600 font-bold">Error: {error}</p>
          ) : userPosts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <MindMapRenderer
              data={userPosts}
              rootNodeId={rootNodeId}
              expandedNodes={expandedNodes}
              onNodeClick={handleNodeClick}
              onToggleExpand={handleToggleExpand}
              setZoomRef={setZoomReference}
              containerDimensions={containerDimensions}
              renderer={renderer}
            />
          )}
        </div>
      </div>
    </UserLayout>
  );
}
