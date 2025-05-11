import { useEffect, useState, useRef, memo } from 'react';
import ReactFlowRenderer from './ReactFlowRenderer';
import { ReactFlowProvider } from 'reactflow';
import { v4 as uuidv4 } from 'uuid'; // Add this import

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
  const dataRef = useRef(null);
  const shouldPreserveViewport = useRef(false);

  useEffect(() => {
    // Validate renderer
    if (!Object.values(RENDERERS).includes(renderer)) {
      setError(`Invalid renderer: ${renderer}. Available renderers: ${Object.values(RENDERERS).join(', ')}`);
    } else {
      setError(null);
    }
  }, [renderer]);

  // Check if this is just an expandedNodes change or if a node was clicked
  useEffect(() => {
    // If data hasn't changed but expandedNodes has,
    // we should preserve viewport
    if (dataRef.current === data) {
      shouldPreserveViewport.current = true;
    } else {
      dataRef.current = data;
      // If a node was clicked, still preserve viewport even if data changed
      shouldPreserveViewport.current = nodeClickedState?.current || false;
    }
    
    // Log the state for debugging
    console.log('shouldPreserveViewport:', shouldPreserveViewport.current);
    console.log('nodeClickedState:', nodeClickedState?.current);
  }, [data, expandedNodes, nodeClickedState]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Always use ReactFlow
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

// Export memoized version of the component
const MemoizedMindMapRenderer = memo(MindMapRenderer);

export { RENDERERS };
export default MemoizedMindMapRenderer;
