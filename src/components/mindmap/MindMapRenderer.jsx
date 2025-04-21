import { useEffect, useState } from 'react';
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
  edgeTypeFilter = { 'parent-child': true, 'related': true }
}) => {
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Validate renderer
    if (!Object.values(RENDERERS).includes(renderer)) {
      setError(`Invalid renderer: ${renderer}. Available renderers: ${Object.values(RENDERERS).join(', ')}`);
    } else {
      setError(null);
    }
  }, [renderer]);

  // Force re-render when data changes
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [data]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Generate a unique key to force re-render when necessary
  const key = `${renderer}-${renderKey}`;

  // Always use ReactFlow
  return (
    <ReactFlowProvider key={key}>
      <ReactFlowRenderer
        data={data}
        rootNodeId={rootNodeId}
        expandedNodes={expandedNodes}
        onNodeClick={onNodeClick}
        onToggleExpand={onToggleExpand}
        setZoomRef={setZoomRef}
        containerDimensions={containerDimensions}
        edgeTypeFilter={edgeTypeFilter}
      />
    </ReactFlowProvider>
  );
};

export { RENDERERS };
export default MindMapRenderer;
