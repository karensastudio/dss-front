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
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [renderer, setRenderer] = useState(RENDERERS.REACT_FLOW);
  
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
  
  // Handle zoom controls
  const handleZoom = (zoomIn) => {
    if (zoomRef) {
      if (zoomIn) {
        zoomRef.zoomIn();
      } else {
        zoomRef.zoomOut();
      }
    }
  };
  
  // Filter data based on decision flag if needed
  const filteredData = isDecisionRelationEnabled && mindmapData
    ? {
        ...mindmapData,
        nodes: mindmapData.nodes.filter(node => node.isDecision),
        edges: mindmapData.edges.filter(edge => {
          const sourceNode = mindmapData.nodes.find(n => n.id === edge.source);
          const targetNode = mindmapData.nodes.find(n => n.id === edge.target);
          return sourceNode?.isDecision && targetNode?.isDecision;
        })
      }
    : mindmapData;
  
  return (
    <UserLayout pageTitle={'Mind Map'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-[16px] md:px-0">
          <div className="flex items-center justify-start divide-x gap-5">
            {isAuthenticated() && (
              <div className="flex flex-col justify-center items-start py-3 pl-5">
                <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                  Only show my decisions:
                </p>
                <Switch
                  checked={isDecisionRelationEnabled}
                  onChange={(checked) => {
                    setDecisionRelationEnabled(checked);
                  }}
                  className={`${
                    isDecisionRelationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Only show decisions</span>
                  <span
                    className={`${
                      isDecisionRelationEnabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            )}
            
            <div className="flex flex-col justify-center items-start py-3 pl-5">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                Renderer:
              </p>
              <select
                value={renderer}
                onChange={(e) => setRenderer(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value={RENDERERS.REACT_FLOW}>React Flow</option>
                <option value={RENDERERS.D3}>D3 Force</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3">
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
          className="bg-gray-50 h-full flex items-center justify-center min-h-full grow"
          id="mindmap-container"
          style={{ height: 'calc(100vh - 200px)' }}
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
            />
          )}
        </div>
      </div>
    </UserLayout>
  );
}
