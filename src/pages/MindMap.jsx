import { useState, useEffect, useCallback } from 'react';
import UserLayout from '../layouts/User';
import { useAuthHeader, useIsAuthenticated } from 'react-auth-kit';
import { getMindmapApi } from '../api/userPost';
import { useNavigate } from 'react-router-dom';
import { HiZoomIn, HiZoomOut } from 'react-icons/hi';
import { Switch } from '@headlessui/react';
import { CgSpinner } from 'react-icons/cg';
import MindMapRenderer, { RENDERERS } from '../components/mindmap/MindMapRenderer';

export default function MindMapPage() {
  const [mindmapData, setMindmapData] = useState(null);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['4'])); // Start with Tutorial (ID: 4) expanded
  const [zoomRef, setZoomRef] = useState(null);
  // Add edge type filter state
  const [edgeTypeFilter, setEdgeTypeFilter] = useState({
    'parent-child': true,
    'related': true
  });
  // Hardcoded to ReactFlow as the only renderer
  const renderer = RENDERERS.REACT_FLOW;
  
  const authHeader = useAuthHeader();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  
  // Fetch mindmap data only once on component mount - fix the continuous loading issue
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
          
          // Log data for debugging
          console.log('Fetched mindmap data:', response.response.data);
          console.log('Tutorial node:', response.response.data.nodes.find(n => n.id === 4));
          console.log('Tutorial edges:', response.response.data.edges.filter(e => e.source === 4));
          
          // Set expanded nodes based on hierarchy
          const initialExpanded = new Set();
          // Start with root and tutorial expanded
          initialExpanded.add('4'); // Tutorial
          
          // Find all top-level nodes and expand them
          response.response.data.edges.forEach(edge => {
            if (edge.source === 4 && edge.type === 'parent-child') {
              initialExpanded.add(`${edge.target}`);
            }
          });
          
          if (response.response.data.hierarchy) {
            initialExpanded.add(`${response.response.data.hierarchy.id}`);
          }
          
          console.log('Initial expanded nodes:', initialExpanded);
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
  
  // Handle node click for navigation
  const handleNodeClick = useCallback((slug) => {
    console.log('Node clicked with slug:', slug);
    navigate(`/posts/${slug}`);
  }, [navigate]);
  
  // Handle toggle expand/collapse
  const handleToggleExpand = useCallback((nodePath) => {
    console.log('Toggling node:', nodePath);
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      console.log('Updated expanded nodes:', newSet);
      return newSet;
    });
  }, []);
  
  // Handle edge type filter changes
  const handleEdgeTypeFilterChange = (type) => {
    setEdgeTypeFilter(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  // No filtering at this level - to be handled by edge type filter
  const filteredData = mindmapData;
  
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
          ) : !filteredData || filteredData.nodes.length === 0 ? (
            <p>No data found.</p>
          ) : (
            <MindMapRenderer
              data={filteredData}
              rootNodeId={4} // Use Tutorial node (ID: 4) as root
              expandedNodes={expandedNodes}
              onNodeClick={handleNodeClick}
              onToggleExpand={handleToggleExpand}
              setZoomRef={setZoomRef}
              containerDimensions={{
                width: document.getElementById('mindmap-container')?.offsetWidth || 800,
                height: document.getElementById('mindmap-container')?.offsetHeight || 600,
              }}
              renderer={renderer}
              edgeTypeFilter={edgeTypeFilter}
            />
          )}
        </div>
      </div>
    </UserLayout>
  );
}
