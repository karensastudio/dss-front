import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import UserLayout from '../layouts/User';
import { useAuthHeader, useIsAuthenticated } from 'react-auth-kit';
import { getMindmapApi } from '../api/userPost';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@headlessui/react';
import { CgSpinner } from 'react-icons/cg';
import MindMapRenderer, { RENDERERS } from '../components/mindmap/MindMapRenderer';
import QuickViewPane from '../components/mindmap/quickview/QuickViewPane';
import { HiZoomIn, HiZoomOut } from 'react-icons/hi';

export default function MindMapPage() {
  // Main data state
  const [mindmapData, setMindmapData] = useState(null);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [expandedNodes, setExpandedNodes] = useState(new Set([])); // Start with no nodes expanded
  const [selectedNodeSlug, setSelectedNodeSlug] = useState(null);
  const [edgeTypeFilter, setEdgeTypeFilter] = useState({
    'parent-child': true,
    'related': false  // Default to off for related connections
  });
  const [horizontalLayout, setHorizontalLayout] = useState(false); // Default to vertical layout
  
  // Refs
  const zoomRef = useRef(null);
  const nodeClickedRef = useRef(false); // Track node clicks for viewport preservation
  
  // Fixed configuration
  const renderer = RENDERERS.REACT_FLOW;
  
  // Hooks
  const authHeader = useAuthHeader();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  
  // Memoize container dimensions to avoid recalculations
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 600
  });
  
  // Update container dimensions when the component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('mindmap-container');
      if (container) {
        setContainerDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };
    
    // Initial measurement
    updateDimensions();
    
    // Update on resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // State for root nodes
  const [rootNodeIds, setRootNodeIds] = useState([4]); // Default to Tutorial node
  
  // Fetch mindmap data only once on component mount
  useEffect(() => {
    let mounted = true;
    
    const fetchMindmapData = async () => {
      if (!mounted) return;
      
      try {
        const response = await getMindmapApi(authHeader());
        
        if (!mounted) return;
        
        if (response.status === 'success') {
          setMindmapData(response.response.data);
          setError(null);
          setIsPostsLoading(false);
          
          // Identify root nodes (nodes without parents)
          // A root node is a node that doesn't appear as a target in any parent-child relationship
          const nodesWithParents = new Set();
          
          // First, find all nodes that have a parent
          response.response.data.edges.forEach(edge => {
            if (edge.type === 'parent-child') {
              nodesWithParents.add(edge.target);
            }
          });
          
          // Root nodes are those that don't have parents
          const rootNodeObjects = response.response.data.nodes
            .filter(node => !nodesWithParents.has(node.id))
            .sort((a, b) => {
              // Sort alphabetically by title (case-insensitive)
              const titleA = (a.title || '').toLowerCase();
              const titleB = (b.title || '').toLowerCase();
              return titleA.localeCompare(titleB);
            });
          
          const rootNodes = rootNodeObjects.map(node => node.id);
          
          // If no root nodes were found, default to first node in the list or id 20
          if (rootNodes.length === 0) {
            const defaultNodeId = response.response.data.nodes.length > 0 
              ? response.response.data.nodes[0].id 
              : 20;
            setRootNodeIds([defaultNodeId]);
          } else {
            setRootNodeIds(rootNodes);
          }
          
          // Start with no nodes expanded
          setExpandedNodes(new Set());
        } else {
          setError(response.message || 'Failed to fetch mindmap data');
          setMindmapData(null);
          setIsPostsLoading(false);
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Error fetching mindmap data:', error);
        setError('An unexpected error occurred.');
        setMindmapData(null);
        setIsPostsLoading(false);
      }
    };

    fetchMindmapData();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once
  
  // Memoized callbacks for better performance
  
  // Handle node click for quick view
  const handleNodeClick = useCallback((slug) => {
    if (!slug || typeof slug !== 'string') {
      return;
    }
    
    // Set node clicked ref to true to preserve viewport
    nodeClickedRef.current = true;
    
    // Toggle view: if already open with same slug, close it
    setSelectedNodeSlug(prev => prev === slug ? null : slug);
  }, []);
  
  // Handle closing the quick view pane
  const handleCloseQuickView = useCallback(() => {
    setSelectedNodeSlug(null);
  }, []);
  
  // Handle toggle expand/collapse of nodes
  const handleToggleExpand = useCallback((nodePath) => {
    // Mark as clicked to preserve viewport
    nodeClickedRef.current = true;
    
    setExpandedNodes(prev => {
      // Create a copy of the Set to avoid reference equality issues
      const newSet = new Set(prev);
      
      // Toggle the node's expanded state
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      
      return newSet;
    });
  }, []);
  
  // Handle edge type filter changes
  const handleEdgeTypeFilterChange = useCallback((type) => {
    setEdgeTypeFilter(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  }, []);
  
  // Function for QuickViewPane node clicks (with preserved state)
  const handleQuickViewNodeClick = useCallback((slug) => {
    // Set the nodeClicked ref to ensure zoom is preserved
    nodeClickedRef.current = true;
    handleNodeClick(slug);
  }, [handleNodeClick]);
  
  // Function to set zoom ref (used by the child component)
  const setZoomRef = useCallback((ref) => {
    zoomRef.current = ref;
  }, []);
  
  // Handle zoom in/out button clicks
  const handleZoom = useCallback((zoomIn) => {
    if (zoomRef.current) {
      if (zoomIn) {
        zoomRef.current.zoomIn();
      } else {
        zoomRef.current.zoomOut();
      }
    }
  }, []);
  
  return (
    <UserLayout pageTitle={'Mind Map'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        {/* Control panel */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            {/* Edge type filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={edgeTypeFilter['parent-child']}
                  onChange={() => handleEdgeTypeFilterChange('parent-child')}
                  className={`${
                    edgeTypeFilter['parent-child'] ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-5 w-10 items-center rounded-full`}
                >
                  <span className="sr-only">Show parent-child connections</span>
                  <span
                    className={`${
                      edgeTypeFilter['parent-child'] ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <span className="text-sm font-medium">Parent-Child</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={edgeTypeFilter['related']}
                  onChange={() => handleEdgeTypeFilterChange('related')}
                  className={`${
                    edgeTypeFilter['related'] ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-5 w-10 items-center rounded-full`}
                >
                  <span className="sr-only">Show related connections</span>
                  <span
                    className={`${
                      edgeTypeFilter['related'] ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <span className="text-sm font-medium">Related</span>
              </div>
            </div>
            
            {/* Layout controls */}
            <div className="flex items-center gap-4 ml-4">
              {/* Layout toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={horizontalLayout}
                  onChange={() => {
                    nodeClickedRef.current = false; // Reset node clicked state for proper fit view
                    setHorizontalLayout(prev => !prev);
                  }}
                  className={`${
                    horizontalLayout ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-5 w-10 items-center rounded-full`}
                >
                  <span className="sr-only">Toggle horizontal layout</span>
                  <span
                    className={`${
                      horizontalLayout ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <span className="text-sm font-medium">Horizontal Layout</span>
              </div>
            </div>
            
            {/* Zoom controls */}
            <div className="flex flex-col justify-center items-start ml-auto">
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

        {/* Main mindmap container */}
        <div
          className="bg-gray-50 h-full flex items-center justify-center min-h-full grow"
          id="mindmap-container"
          style={{ height: 'calc(100vh - 150px)' }}
        >
          {isPostsLoading ? (
            <div className="flex items-center justify-center">
              <CgSpinner className="animate-spin text-[48px] text-blue-600" />
            </div>
          ) : error ? (
            <p className="text-xl text-red-600 font-bold">Error: {error}</p>
          ) : !mindmapData || mindmapData.nodes.length === 0 ? (
            <p>No data found.</p>
          ) : (
            <MindMapRenderer
              data={mindmapData}
              rootNodeId={rootNodeIds} // Use all identified root nodes
              expandedNodes={expandedNodes}
              onNodeClick={handleNodeClick}
              onToggleExpand={handleToggleExpand}
              setZoomRef={setZoomRef}
              containerDimensions={containerDimensions}
              renderer={renderer}
              edgeTypeFilter={edgeTypeFilter}
              key="mindmap-renderer" 
              nodeClickedState={nodeClickedRef}
              horizontalLayout={horizontalLayout} // Use the state variable
            />
          )}
        </div>
      </div>
      
      {/* Quick View Pane */}
      <QuickViewPane 
        slug={selectedNodeSlug}
        isOpen={Boolean(selectedNodeSlug)}
        onClose={handleCloseQuickView}
        onNodeClick={handleQuickViewNodeClick}
      />
    </UserLayout>
  );
}
