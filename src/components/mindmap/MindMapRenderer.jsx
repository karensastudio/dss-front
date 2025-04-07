import { useEffect, useState } from 'react';
import D3Renderer from './D3Renderer';

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
 * @param {Array} props.data - Data to render in the mind map
 * @param {string|number} props.rootNodeId - ID of the root node
 * @param {Set} props.expandedNodes - Set of expanded node paths
 * @param {Function} props.onNodeClick - Click handler for nodes
 * @param {Function} props.onToggleExpand - Handler for expanding/collapsing nodes
 * @param {Function} props.setZoomRef - Function to set zoom reference externally
 * @param {Object} props.containerDimensions - {width, height} of the container
 * @param {string} props.renderer - Renderer type to use (defaults to D3)
 */
const MindMapRenderer = ({
  data,
  rootNodeId,
  expandedNodes,
  onNodeClick,
  onToggleExpand,
  setZoomRef,
  containerDimensions,
  renderer = RENDERERS.D3
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate renderer
    if (!Object.values(RENDERERS).includes(renderer)) {
      setError(`Invalid renderer: ${renderer}. Available renderers: ${Object.values(RENDERERS).join(', ')}`);
    } else {
      setError(null);
    }
  }, [renderer]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Render using the selected renderer
  switch (renderer) {
    case RENDERERS.D3:
      return (
        <D3Renderer
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
      // Placeholder for future implementation
      return <div>React Flow renderer not implemented yet</div>;
    case RENDERERS.REACT_D3_TREE:
      // Placeholder for future implementation
      return <div>React D3 Tree renderer not implemented yet</div>;
    default:
      return <div>No renderer selected</div>;
  }
};

export { RENDERERS };
export default MindMapRenderer;
