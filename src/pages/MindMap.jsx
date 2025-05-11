import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import UserLayout from '../layouts/User';
import { useAuthHeader, useIsAuthenticated } from 'react-auth-kit';
import { getMindmapApi } from '../api/userPost';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@headlessui/react';
import { CgSpinner } from 'react-icons/cg';
import MindMapRenderer, { RENDERERS } from '../components/mindmap/MindMapRenderer';
import QuickViewPane from '../components/mindmap/quickview/QuickViewPane';

export default function MindMapPage() {
  // Main data state
  const [mindmapData, setMindmapData] = useState(null);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [expandedNodes, setExpandedNodes] = useState(new Set(['4'])); // Start with Tutorial (ID: 4) expanded
  const [selectedNodeSlug, setSelectedNodeSlug] = useState(null);
  const [edgeTypeFilter, setEdgeTypeFilter] = useState({
    'parent-child': true,
    'related': false  // Default to off for related connections
  });
  
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
          
          // Set expanded nodes based on hierarchy
          const initialExpanded = new Set();
          // Start with Tutorial expanded
          initialExpanded.add('4');
          
          // Find all top-level nodes and expand them
          response.response.data.edges.forEach(edge => {
            if (edge.source === 4 && edge.type === 'parent-child') {
              initialExpanded.add(`${edge.target}`);
            }
          });
          
          // Add hierarchy root if available
          if (response.response.data.hierarchy) {
            initialExpanded.add(`${response.response.data.hierarchy.id}`);
          }
          
          setExpandedNodes(initialExpanded);
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
  
  return (
    <UserLayout pageTitle={'Mind Map'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        {/* Edge type filter panel */}
        <div className="p-3 border-b">
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
              rootNodeId={4} // Use Tutorial node (ID: 4) as root
              expandedNodes={expandedNodes}
              onNodeClick={handleNodeClick}
              onToggleExpand={handleToggleExpand}
              setZoomRef={setZoomRef}
              containerDimensions={containerDimensions}
              renderer={renderer}
              edgeTypeFilter={edgeTypeFilter}
              key="mindmap-renderer" 
              nodeClickedState={nodeClickedRef}
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
