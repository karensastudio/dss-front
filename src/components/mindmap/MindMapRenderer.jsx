import { useEffect, useState, useRef, memo } from 'react';
import ReactFlowRenderer from './ReactFlowRenderer';
import { ReactFlowProvider } from 'reactflow';

// Define possible rendering engines
const RENDERERS = {
  REACT_FLOW: 'REACT_FLOW'
};

/**
 * MindMapRenderer serves as an abstraction layer for different mind map visualization libraries
 * 
 * @param {Object} props
 * @param {Object} props.data - Data to render in the mind map (nodes, edges, hierarchy)
 * @param {Array|string|number} props.rootNodeId - ID(s) of the root node(s), can be a single ID or an array of IDs
 * @param {Set} props.expandedNodes - Set of expanded node paths
 * @param {Function} props.onNodeClick - Click handler for nodes
 * @param {Function} props.onToggleExpand - Handler for expanding/collapsing nodes
 * @param {Function} props.setZoomRef - Function to set zoom reference externally
 * @param {Object} props.containerDimensions - {width, height} of the container
 * @param {string} props.renderer - Renderer type to use (defaults to REACT_FLOW)
 * @param {Object} props.edgeTypeFilter - Filter for edge types {parent-child: bool, related: bool}
 * @param {Object} props.nodeClickedState - Ref from parent to track if a node was clicked
 * @param {boolean} props.horizontalLayout - Whether to use horizontal layout (default: false)
 */
const MindMapRenderer = ({
  data,
  rootNodeId,
  expandedNodes,
  onNodeClick,
  onToggleExpand,
  setZoomRef,
  containerDimensions,
  renderer = RENDERERS.REACT_FLOW,
  edgeTypeFilter = { 'parent-child': true, 'related': true },
  nodeClickedState = null,
  horizontalLayout = false
}) => {
  const [error, setError] = useState(null);
  
  // Refs for tracking state changes
  const dataRef = useRef(null);
  const shouldPreserveViewport = useRef(false);

  // Validate renderer
  useEffect(() => {
    if (!Object.values(RENDERERS).includes(renderer)) {
      setError(`Invalid renderer: ${renderer}. Available renderers: ${Object.values(RENDERERS).join(', ')}`);
    } else {
      setError(null);
    }
  }, [renderer]);

  // Determine when to preserve viewport
  useEffect(() => {
    // Case 1: Same data but expanded nodes changed - preserve viewport
    // Case 2: Data changed but node was clicked - preserve viewport
    // Case 3: Data changed and no node was clicked - don't preserve viewport
    if (dataRef.current === data) {
      shouldPreserveViewport.current = true;
    } else {
      dataRef.current = data;
      shouldPreserveViewport.current = nodeClickedState?.current || false;
    }
  }, [data, expandedNodes, nodeClickedState]);

  // Show error if any
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Currently, only ReactFlow is supported
  return (
    <ReactFlowProvider>
      <ReactFlowRenderer
        data={data}
        rootNodeId={rootNodeId}
        expandedNodes={expandedNodes}
        onNodeClick={onNodeClick}
        onToggleExpand={onToggleExpand}
        setZoomRef={setZoomRef}
        containerDimensions={containerDimensions}
        edgeTypeFilter={edgeTypeFilter}
        preserveViewport={shouldPreserveViewport.current || nodeClickedState?.current}
        nodeClickedState={nodeClickedState}
        horizontalLayout={horizontalLayout}
      />
    </ReactFlowProvider>
  );
};

// Export memoized version of the component for better performance
// Add a special key for MemoizedMindMapRenderer to properly update when rootNodeId changes from scalar to array
const MemoizedMindMapRenderer = memo(MindMapRenderer, (prevProps, nextProps) => {
  // Check if rootNodeId changed from scalar to array or vice versa
  const prevIsArray = Array.isArray(prevProps.rootNodeId);
  const nextIsArray = Array.isArray(nextProps.rootNodeId);
  
  if (prevIsArray !== nextIsArray) {
    return false; // Force update
  }
  
  // For arrays, check if the content changed
  if (prevIsArray && nextIsArray) {
    if (prevProps.rootNodeId.length !== nextProps.rootNodeId.length) {
      return false; // Force update
    }
    
    for (let i = 0; i < prevProps.rootNodeId.length; i++) {
      if (prevProps.rootNodeId[i] !== nextProps.rootNodeId[i]) {
        return false; // Force update
      }
    }
  }
  
  // For scalar values, simple comparison
  if (!prevIsArray && !nextIsArray && prevProps.rootNodeId !== nextProps.rootNodeId) {
    return false; // Force update
  }
  
  // Let React's default memoization handle other props
  return undefined;
});

export { RENDERERS };
export default MemoizedMindMapRenderer;
