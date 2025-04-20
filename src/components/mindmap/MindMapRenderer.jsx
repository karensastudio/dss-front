import { useEffect, useState } from 'react';
import D3Renderer from './D3Renderer';
import ReactFlowRenderer from './ReactFlowRenderer';
import { ReactFlowProvider } from 'reactflow';
import { v4 as uuidv4 } from 'uuid'; // Add this import

// Define possible rendering engines
const RENDERERS = {
  D3: 'D3',
  REACT_FLOW: 'REACT_FLOW',
  REACT_D3_TREE: 'REACT_D3_TREE'
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
 */
const MindMapRenderer = ({
  data,
  rootNodeId,
  expandedNodes,
  onNodeClick,
  onToggleExpand,
  setZoomRef,
  containerDimensions,
  renderer = RENDERERS.REACT_FLOW
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

  // Render using the selected renderer
  switch (renderer) {
    case RENDERERS.D3:
      return (
        <D3Renderer
          key={key}
          data={data}
          rootNodeId={rootNodeId}
          expandedNodes={expandedNodes}
          onNodeClick={onNodeClick}
          onToggleExpand={onToggleExpand}
          setZoomRef={setZoomRef}
          containerDimensions={containerDimensions}
        />
      );
    case RENDERERS.REACT_FLOW:
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
          />
        </ReactFlowProvider>
      );
    case RENDERERS.REACT_D3_TREE:
      // Placeholder for future implementation
      return <div>React D3 Tree renderer not implemented yet</div>;
    default:
      return <div>No renderer selected</div>;
  }
};

export { RENDERERS };
export default MindMapRenderer;
