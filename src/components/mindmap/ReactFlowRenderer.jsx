import { useCallback, useEffect, useState, useMemo } from 'react';
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

// Helper function to create a hierarchical tree layout
const getHierarchicalLayout = (nodes, edges, rootId) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set the layout options for better hierarchical visualization
  dagreGraph.setGraph({ 
    rankdir: 'TB',  // Top to bottom layout for better tree visualization
    nodesep: 100,   // More horizontal space between nodes for longer titles
    ranksep: 120,   // More vertical space between levels
    marginx: 50,
    marginy: 50,
    align: 'UL'
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 70 }); // Increased width for longer titles
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    // Include all edges for layout calculation
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Apply layout
  dagre.layout(dagreGraph);

  // Get the positions
  const layoutedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    if (!dagreNode) {
      // If node wasn't found in the graph, give it a default position
      return {
        ...node,
        position: { x: 0, y: 0 }
      };
    }
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';
    
    return {
      ...node,
      position: {
        x: dagreNode.x - 140, // Center the node (increased for wider nodes)
        y: dagreNode.y - 35,  // Center the node
      },
    };
  });

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
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, setViewport, getViewport } = useReactFlow();

  // Color scale for section tags
  const sectionColors = useMemo(() => [
    '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', 
    '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'
  ], []);

  // Transform data into React Flow format
  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    console.log('RootNodeId:', rootNodeId);
    console.log('Nodes:', data.nodes);
    console.log('Edges:', data.edges);
    console.log('Expanded Nodes:', expandedNodes);

    const transformData = () => {
      const flowNodes = [];
      const flowEdges = [];
      
      // Create a map for quick node lookup
      const nodeMap = new Map(data.nodes.map(node => [node.id, node]));
      
      // Get all node IDs for debugging
      console.log('All node IDs:', Array.from(nodeMap.keys()));
      
      // Process nodes and create a hierarchical structure
      const processedNodes = new Set();
      
      // Count children for each node - consider both parent-child and related
      const childrenCount = new Map();
      data.edges.forEach(edge => {
        if (edge.source === rootNodeId) { // For the root node, count all connections as children
          childrenCount.set(edge.source, (childrenCount.get(edge.source) || 0) + 1);
        } else if (edge.type === 'parent-child') {
          childrenCount.set(edge.source, (childrenCount.get(edge.source) || 0) + 1);
        }
      });
      
      console.log('Children count map:', childrenCount);
      
      // Start from root node and traverse the hierarchy
      const traverseHierarchy = (nodeId, parentId = null, level = 0) => {
        if (processedNodes.has(nodeId)) return;
        
        const node = nodeMap.get(nodeId);
        if (!node) {
          console.log(`Node ${nodeId} not found in nodeMap`);
          return;
        }
        
        console.log(`Processing node ${nodeId} (${node.title}) at level ${level}`);
        
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
            hasChildren: hasChildren,
            onToggleExpand: () => onToggleExpand(`${nodeId}`),
            onNodeClick: () => onNodeClick(node.slug),
            sectionColor: sectionTag ? sectionColors[sectionTag.name.charCodeAt(8) % sectionColors.length] : '#cccccc',
            priority: node.priority,
          },
          position: { x: 0, y: 0 }, // Will be set by dagre
        });
        
        // If this node is expanded or is the root, process its children
        if (isExpanded || !parentId) {
          // Find all connections - for root node, consider all connections
          let childEdges;
          if (nodeId === rootNodeId) {
            childEdges = data.edges.filter(edge => edge.source === nodeId);
          } else {
            childEdges = data.edges.filter(edge => 
              edge.source === nodeId && edge.type === 'parent-child'
            );
          }
          
          console.log(`Node ${nodeId} has ${childEdges.length} child edges`);
          
          childEdges.forEach(edge => {
            traverseHierarchy(edge.target, nodeId, level + 1);
          });
        }
      };
      
      // Start traversal from root
      traverseHierarchy(rootNodeId);
      
      // Create edges for the processed nodes
      data.edges.forEach(edge => {
        const sourceProcessed = processedNodes.has(edge.source);
        const targetProcessed = processedNodes.has(edge.target);
        
        if (sourceProcessed && targetProcessed) {
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
            labelStyle: { fill: '#555', fontSize: 10 },
            labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
            zIndex: edge.type === 'parent-child' ? 1 : 0, // Ensure parent-child edges are on top
          });
        }
      });
      
      console.log('Processed nodes:', flowNodes);
      console.log('Processed edges:', flowEdges);
      
      // Apply hierarchical layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getHierarchicalLayout(
        flowNodes,
        flowEdges,
        `node-${rootNodeId}`
      );
      
      return { nodes: layoutedNodes, edges: layoutedEdges };
    };
    
    const { nodes: newNodes, edges: newEdges } = transformData();
    setNodes(newNodes);
    setEdges(newEdges);
    
    // Fit view with animation after nodes are set
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 100);
  }, [data, rootNodeId, expandedNodes, onNodeClick, onToggleExpand, sectionColors, fitView]);
  
  // Export zoom reference for external control
  useEffect(() => {
    if (setZoomRef) {
      setZoomRef({
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
        fitView: () => fitView({ padding: 0.2, duration: 400 }),
      });
    }
  }, [setZoomRef, getViewport, setViewport, fitView]);
  
  // Handle node click
  const onNodeClickHandler = useCallback((event, node) => {
    if (node.data.slug) {
      onNodeClick(node.data.slug);
    }
  }, [onNodeClick]);
  
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={4}
        attributionPosition="bottom-right"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-right" />
        <MiniMap 
          nodeColor={(node) => node.data.sectionColor}
          maskColor="#00000020"
          style={{ background: '#f5f5f5', border: '1px solid #ddd' }}
        />
        <Background gap={20} size={1} color="#ddd" variant="dots" />
        <Panel position="top-right" className="bg-white p-2 rounded shadow">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 border-2 border-yellow-500 rounded"></div>
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

export default ReactFlowRenderer;
