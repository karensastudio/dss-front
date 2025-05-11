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
 * @param {string|number} props.rootNodeId - ID of the root node
 * @param {Set} props.expandedNodes - Set of expanded node paths
 * @param {Function} props.onNodeClick - Click handler for nodes
 * @param {Function} props.onToggleExpand - Handler for expanding/collapsing nodes
 * @param {Function} props.setZoomRef - Function to set zoom reference externally
 * @param {Object} props.containerDimensions - {width, height} of the container
 * @param {string} props.renderer - Renderer type to use (defaults to REACT_FLOW)
 * @param {Object} props.edgeTypeFilter - Filter for edge types {parent-child: bool, related: bool}
 * @param {Object} props.nodeClickedState - Ref from parent to track if a node was clicked
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
  nodeClickedState = null
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
      />
    </ReactFlowProvider>
  );
};

// Export memoized version of the component for better performance
const MemoizedMindMapRenderer = memo(MindMapRenderer);

export { RENDERERS };
export default MemoizedMindMapRenderer;
