import { useCallback, useEffect, useState, useMemo, useRef, memo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import './mindmap.css';

// Custom node components
import DecisionNode from './nodes/DecisionNode';
import StandardNode from './nodes/StandardNode';

// Define node types
const nodeTypes = {
  decision: DecisionNode,
  standard: StandardNode,
};

// Add this constant at the top of the getHierarchicalLayout function
const LEFT_OFFSET = 150; // Adjust this value to control the left spacing

/**
 * Creates a hierarchical tree layout using the dagre library
 * 
 * @param {Array} nodes - The nodes to lay out
 * @param {Array} edges - The edges connecting the nodes
 * @param {Array|string} rootIds - The ID(s) of the root node(s), can be a single ID or an array of IDs
 * @param {boolean} horizontalLayout - Whether to use horizontal layout
 * @returns {Object} Object containing layouted nodes and edges
 */
const getHierarchicalLayout = (nodes, edges, rootIds, horizontalLayout = false) => {
  const LEFT_OFFSET = 150; // Add left spacing for all nodes
  const TUTORIAL_Y_OFFSET = 150; // Consistent Y distance between Tutorial and other root nodes
  const SPECIAL_NODE_IDS = ['node-4', 'node-20']; // Tutorial and node 20 are special nodes
  
  console.log('getHierarchicalLayout called with:', { 
    nodesCount: nodes.length, 
    edgesCount: edges.length, 
    rootIds, 
    horizontalLayout,
    allNodeIds: nodes.map(n => n.id)
  });
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set the layout options for better hierarchical visualization
  dagreGraph.setGraph({ 
    rankdir: horizontalLayout ? 'LR' : 'TB',  // Left to right for horizontal layout, Top to bottom for vertical
    nodesep: horizontalLayout ? 50 : 100,    // More horizontal space between nodes for longer titles
    ranksep: horizontalLayout ? 250 : 100,    // More vertical space between levels
    marginx: 50,
    marginy: 50,
    align: 'UL'
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 90 }); // Increased height from 70 to 90
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    // Include all edges for layout calculation
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // For root nodes without edges, ensure they are properly positioned
  const rootNodeIds = Array.isArray(rootIds) ? rootIds : [rootIds];
  
  // Reserve special positions for root nodes to maintain their order
  rootNodeIds.forEach((rootId, index) => {
    const rootNodeId = typeof rootId === 'string' ? rootId : `node-${rootId}`;
    dagreGraph.setNode(rootNodeId, { 
      width: 280, 
      height: 90, // Increased height from 70 to 90
      // Set a rank to maintain ordering
      rank: horizontalLayout ? 0 : index,  // All in same rank for horizontal, different ranks for vertical
      order: horizontalLayout ? index : 0   // Ordering within rank
    });
  });
  
  // Apply layout
  dagre.layout(dagreGraph);

  // Get the positions with LEFT_OFFSET added
  const layoutedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    if (!dagreNode) {
      // If node wasn't found in the graph, give it a default position with left offset
      return {
        ...node,
        position: { x: LEFT_OFFSET, y: 0 },
        // Always set targetPosition and sourcePosition based on current layout
        targetPosition: horizontalLayout ? 'left' : 'top',
        sourcePosition: horizontalLayout ? 'right' : 'bottom'
      };
    }
    
    return {
      ...node,
      position: {
        x: dagreNode.x - 140 + LEFT_OFFSET, // Add LEFT_OFFSET here
        y: dagreNode.y - 35,  // Center the node
      },
      // Always set targetPosition and sourcePosition based on current layout
      targetPosition: horizontalLayout ? 'left' : 'top',
      sourcePosition: horizontalLayout ? 'right' : 'bottom'
    };
  });

  // Handle root nodes with no connections between them
  const rootNodes = layoutedNodes.filter(node => 
    rootIds.includes(node.id)
  );
  
  console.log('Debug layout:', { 
    rootNodes: rootNodes.map(n => ({ id: n.id, label: n.data.label })), 
    edgesCount: edges.length, 
    rootNodesCount: rootNodes.length,
    shouldApplyManualLayout: rootNodes.length > 1 && edges.length === 0
  });
  
  // Apply manual grid layout for multiple root nodes ONLY when no edges exist (no expanded nodes)
  if (rootNodes.length > 1 && edges.length === 0) {
    // Separate special nodes (Tutorial and node 20) from other root nodes
    const specialNodes = rootNodes.filter(node => SPECIAL_NODE_IDS.includes(node.id));
    const otherRootNodes = rootNodes.filter(node => !SPECIAL_NODE_IDS.includes(node.id));
    
    // Sort other root nodes alphabetically by title
    otherRootNodes.sort((a, b) => {
      const titleA = a.data.label.toLowerCase();
      const titleB = b.data.label.toLowerCase();
      return titleA.localeCompare(titleB);
    });
    
    // Position special nodes in the top row
    specialNodes.forEach((node, index) => {
      if (horizontalLayout) {
        node.position.x = index * 350 + LEFT_OFFSET;
        node.position.y = 0;
      } else {
        node.position.x = index * 350 + LEFT_OFFSET;
        node.position.y = 0;
      }
    });
    
    // Position other root nodes in the bottom row - SINGLE ROW ONLY with left offset
    if (otherRootNodes.length > 0) {
      otherRootNodes.forEach((node, index) => {
        if (horizontalLayout) {
          // Horizontal layout - arrange nodes in a single row from left to right, below special nodes
          node.position.x = index * 350 + LEFT_OFFSET; // Add LEFT_OFFSET
          node.position.y = 150; // Position below special nodes
        } else {
          // Vertical layout - arrange nodes in a single row horizontally, below special nodes
          node.position.x = index * 350 + LEFT_OFFSET; // Add LEFT_OFFSET
          node.position.y = 150; // Single row at y: 150
        }
      });
    }
  }

  // Always position special nodes at a fixed distance above other root nodes
  const specialNodes = layoutedNodes.filter(node => SPECIAL_NODE_IDS.includes(node.id));
  if (specialNodes.length > 0) {
    // Find the other root nodes (excluding special nodes)
    const otherRootNodes = layoutedNodes.filter(node => 
      rootIds.includes(node.id) && !SPECIAL_NODE_IDS.includes(node.id)
    );
    
    if (otherRootNodes.length > 0) {
      // Get the Y position of the other root nodes
      const rootNodesY = Math.min(...otherRootNodes.map(node => node.position.y));
      
      // Position special nodes at a fixed distance above the root nodes
      specialNodes.forEach((specialNode, index) => {
        specialNode.position.y = rootNodesY - TUTORIAL_Y_OFFSET;
        
        // Position them horizontally with spacing
        const minX = Math.min(...otherRootNodes.map(node => node.position.x));
        specialNode.position.x = minX + (index * 350); // Space them 350px apart
      });
    } else {
      // If there are no other root nodes, use default positions
      specialNodes.forEach((specialNode, index) => {
        specialNode.position.x = LEFT_OFFSET + (index * 350);
        specialNode.position.y = 0;
      });
    }
  }

  return { nodes: layoutedNodes, edges };
};

/**
 * React Flow based mindmap renderer
 */
const ReactFlowRenderer = ({
  data,
  rootNodeId,
  expandedNodes,
  onNodeClick,
  onToggleExpand,
  setZoomRef,
  containerDimensions,
  edgeTypeFilter = { 'parent-child': true, 'related': true },
  preserveViewport = false,
  nodeClickedState = null,
  horizontalLayout = false,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, setViewport, getViewport } = useReactFlow();
  
  // Refs for tracking viewport state
  const initialLayoutDoneRef = useRef(false);
  const nodeClickedRef = useRef(false);
  const viewportStateRef = useRef(null);

  // Color scale for section tags
  const sectionColors = useMemo(() => [
    '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', 
    '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'
  ], []);

  /**
   * Transform mindmap data into React Flow format
   */
  const transformData = useCallback(() => {
    if (!data || !data.nodes || !data.edges) return { nodes: [], edges: [] };
    
    console.log('transformData called with:', { 
      dataNodes: data.nodes.length, 
      dataEdges: data.edges.length, 
      rootNodeId,
      firstFewNodes: data.nodes.slice(0, 3).map(n => ({ id: n.id, title: n.title }))
    });
    
    const flowNodes = [];
    const flowEdges = [];
    
    // Create a map for quick node lookup
    const nodeMap = new Map(data.nodes.map(node => [node.id, node]));
    
    // Process nodes and create a hierarchical structure
    const processedNodes = new Set();
    
    // Count children for each node - consider only parent-child relationships
    const childrenCount = new Map();
    data.edges.forEach(edge => {
      if (edge.type === 'parent-child') {
        childrenCount.set(edge.source, (childrenCount.get(edge.source) || 0) + 1);
      }
    });
    
    // Handle rootNodeId as an array or single value
    const rootNodeIds = Array.isArray(rootNodeId) ? rootNodeId : [rootNodeId];
    
    // Get the root node objects and sort them alphabetically by title
    const sortedRootNodes = rootNodeIds
      .map(id => nodeMap.get(id))
      .filter(node => node) // Filter out any undefined nodes
      .sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });
    
    // Use sorted node IDs for traversal
    const sortedRootNodeIds = sortedRootNodes.map(node => node.id);
    
    // Start from root node(s) and traverse the hierarchy
    const traverseHierarchy = (nodeId, parentId = null, level = 0) => {
      if (processedNodes.has(nodeId)) return;
      
      const node = nodeMap.get(nodeId);
      if (!node) return;
      
      // Add this node
      processedNodes.add(nodeId);
      
      const sectionTag = node.tags?.find(tag => tag.name?.startsWith('Section'));
      const isExpanded = expandedNodes.has(`${nodeId}`);
      const hasChildren = childrenCount.get(nodeId) > 0;
      
      flowNodes.push({
        id: `node-${nodeId}`,
        type: node.isDecision ? 'decision' : 'standard',
        data: {
          label: node.title || 'Untitled',
          slug: node.slug,
          isExpanded: isExpanded,
          hasChildren: hasChildren && !['node-4', 'node-20'].includes(`node-${nodeId}`), // Disable expansion for special nodes
          onToggleExpand: () => onToggleExpand(`${nodeId}`),
          onNodeClick: () => onNodeClick(node.slug),
          sectionColor: sectionTag ? sectionColors[sectionTag.name.charCodeAt(8) % sectionColors.length] : '#cccccc',
          priority: node.priority,
        },
        position: { x: 0, y: 0 }, // Will be set by dagre
        sourcePosition: horizontalLayout ? 'right' : 'bottom',
        targetPosition: horizontalLayout ? 'left' : 'top'
      });
      
      // Only process children if this node is expanded
      if (isExpanded) {
        // Find all parent-child connections
        const childEdges = data.edges.filter(edge => 
          edge.source === nodeId && edge.type === 'parent-child'
        );
        
        childEdges.forEach(edge => {
          traverseHierarchy(edge.target, nodeId, level + 1);
        });
      }
    };
    
    // Start traversal from all sorted root nodes
    sortedRootNodeIds.forEach(id => traverseHierarchy(id));
    
    // After all nodes are processed, create edges only for the processed nodes
    // that match the edge type filter
    data.edges.forEach(edge => {
      const sourceProcessed = processedNodes.has(edge.source);
      const targetProcessed = processedNodes.has(edge.target);
      
      // Only include edges that match the edge type filter and connect processed nodes
      if (sourceProcessed && targetProcessed && edgeTypeFilter[edge.type]) {
        // For parent-child relationships, only show edges when parent is expanded
        if (edge.type === 'parent-child' && !expandedNodes.has(`${edge.source}`)) {
          return; // Skip this edge if parent node is not expanded
        }
        
        flowEdges.push({
          id: `edge-${edge.source}-${edge.target}`,
          source: `node-${edge.source}`,
          target: `node-${edge.target}`,
          type: edge.type === 'parent-child' ? 'smoothstep' : 'straight',
          animated: edge.type === 'related',
          style: {
            stroke: edge.type === 'parent-child' ? '#555' : '#999',
            strokeWidth: edge.type === 'parent-child' ? 2 : 1,
            strokeDasharray: edge.type === 'related' ? '5 5' : undefined,
          },
          label: edge.type === 'related' ? 'related' : undefined,
          labelStyle: { fill: '#333', fontSize: 11, fontWeight: 'bold' },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.8, padding: 2 },
          zIndex: edge.type === 'parent-child' ? 1 : 0, // Ensure parent-child edges are on top
          // Explicitly define connection points for edges based on layout
          sourceHandle: horizontalLayout ? 'right' : 'bottom',
          targetHandle: horizontalLayout ? 'left' : 'top'
        });
      }
    });
    
    // Apply hierarchical layout
    return getHierarchicalLayout(
      flowNodes,
      flowEdges,
      sortedRootNodeIds.map(id => `node-${id}`),
      horizontalLayout
    );
  }, [data, rootNodeId, expandedNodes, onNodeClick, onToggleExpand, sectionColors, edgeTypeFilter, horizontalLayout]);

  // Transform data into React Flow format
  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;
  
    // Always save current viewport state if layout is already done
    if (initialLayoutDoneRef.current) {
      // Only update viewport state if we don't already have one from nodeClick
      if (!nodeClickedRef.current) {
        viewportStateRef.current = getViewport();
      }
    }
  
    // Calculate new nodes and edges
    const { nodes: newNodes, edges: newEdges } = transformData();
    
    // Set nodes and edges
    setNodes(newNodes);
    setEdges(newEdges);
    
    // Decide whether to fit view or preserve viewport
    setTimeout(() => {
      if (!initialLayoutDoneRef.current) {
        // Only fit view on the very first render
        fitView({ padding: 0.3, duration: 400 });
        initialLayoutDoneRef.current = true;
        // Save the initial viewport state after first layout
        viewportStateRef.current = getViewport();
      } else {
        // For all subsequent updates, preserve viewport
        if (viewportStateRef.current) {
          setViewport(viewportStateRef.current);
        }
      }
      
      // Reset node clicked state after layout is done, but only if not in a quick view
      nodeClickedRef.current = false;
      
      // We do NOT reset the parent's nodeClickedState here
      // This should be handled by the parent component after the quick view is dismissed
    }, 100);
  }, [data, rootNodeId, expandedNodes, fitView, getViewport, setViewport, nodeClickedState, transformData, horizontalLayout]);
  
  // Export zoom reference for external control
  useEffect(() => {
    if (setZoomRef) {
      const zoomControls = {
        zoomIn: () => {
          const currentViewport = getViewport();
          setViewport({ 
            zoom: currentViewport.zoom * 1.2,
            x: currentViewport.x,
            y: currentViewport.y 
          });
        },
        zoomOut: () => {
          const currentViewport = getViewport();
          setViewport({ 
            zoom: currentViewport.zoom / 1.2,
            x: currentViewport.x,
            y: currentViewport.y 
          });
        },
        fitView: () => fitView({ padding: 0.3, duration: 400 }),
      };
      
      // Pass zoom controls to parent via callback
      setZoomRef(zoomControls);
    }
  }, [setZoomRef, getViewport, setViewport, fitView]);
  
  // Add ref to track if a node has been clicked in the past
  const hasInteractedRef = useRef(false);
  
  // Handle node click
  const onNodeClickHandler = useCallback((event, node) => {
    if (node.data.slug) {
      // Save the current viewport state before opening the overview
      viewportStateRef.current = getViewport();
      
      // Set the nodeClicked ref to true to prevent fitView from running
      nodeClickedRef.current = true;
      
      // Mark that user has interacted with the graph
      hasInteractedRef.current = true;
      
      // Also set the parent's nodeClicked ref if available
      if (nodeClickedState) {
        nodeClickedState.current = true;
      }
      
      onNodeClick(node.data.slug);
    }
  }, [onNodeClick, nodeClickedState, getViewport]);
  
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        key={`flow-${horizontalLayout ? 'horizontal' : 'vertical'}`} /* Force re-render when layout changes */
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView={!initialLayoutDoneRef.current}
        minZoom={0.2}
        maxZoom={4}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" />
        <MiniMap 
          position="bottom-left"
          nodeColor={(node) => node.data.sectionColor}
          maskColor="#00000020"
          style={{ background: '#f5f5f5', border: '1px solid #ddd' }}
        />
        <Background gap={20} size={1} color="#ddd" variant="dots" />
        <Panel position="top-left" className="bg-white p-2 rounded shadow">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 border-2 border-yellow-500 rounded" style={{ backgroundColor: '#FFFAF0' }}></div>
              <span>Decision</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-0.5 bg-gray-400"></div>
              <span>Parent-Child</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-dashed border-t-2 border-gray-400"></div>
              <span>Related</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Export the memoized component to prevent unnecessary re-renders
export default memo(ReactFlowRenderer);