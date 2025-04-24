import { useEffect, useRef } from "react";
import * as d3 from 'd3';
import './mindmap.css';

/**
 * D3-based mindmap renderer implementation
 * 
 * @param {Object} props
 * @param {Array} props.data - Original data posts
 * @param {string|number} props.rootNodeId - ID of the root node
 * @param {Set} props.expandedNodes - Set of expanded node paths
 * @param {Function} props.onNodeClick - Click handler for nodes
 * @param {Function} props.onToggleExpand - Handler for expanding/collapsing nodes
 * @param {Function} props.setZoomRef - Function to set the zoom reference externally
 * @param {Object} props.containerDimensions - {width, height} of the container
 */
const D3Renderer = ({
  data,
  rootNodeId,
  expandedNodes,
  onNodeClick,
  onToggleExpand,
  setZoomRef,
  containerDimensions
}) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !rootNodeId) {
      return;
    }

    // Get dimensions, fall back to parent element if containerDimensions not provided
    let width = 800;  // Default fallback
    let height = 600; // Default fallback
    
    if (containerDimensions && containerDimensions.width && containerDimensions.height) {
      width = containerDimensions.width;
      height = containerDimensions.height;
    } else if (svgRef.current && svgRef.current.parentElement) {
      const parentRect = svgRef.current.parentElement.getBoundingClientRect();
      width = parentRect.width;
      height = parentRect.height;
    }
    
    // Ensure minimum dimensions
    width = Math.max(width, 300);
    height = Math.max(height, 300);
    
    // Remove old visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    const g = svg.append('g');
    
    // Create hierarchical data structure
    const rootPost = data.find(post => post.id === rootNodeId);
    if (!rootPost) return;
    
    // Function to create hierarchical structure
    const buildHierarchy = (node, level = 0, parentPath = '') => {
      if (!node) return null;
      
      const currentPath = parentPath ? `${parentPath}-${node.id}` : `${node.id}`;
      const isExpanded = expandedNodes.has(currentPath);
      
      // Base node data
      const nodeData = {
        id: node.id,
        name: node.title || 'Untitled',
        slug: node.slug,
        tags: node.tags || [],
        is_decision: node.is_decision || false,
        level: level,
        path: currentPath,
        isExpanded: isExpanded,
        originalNode: node
      };
      
      // Only process children if the node is expanded
      if (isExpanded) {
        const children = [];
        
        // Add direct children
        if (node.children && node.children.length > 0) {
          node.children.forEach(childRef => {
            const childPost = data.find(p => p.id === childRef.id);
            if (childPost) {
              const childNode = buildHierarchy(childPost, level + 1, currentPath);
              if (childNode) {
                children.push(childNode);
              }
            }
          });
        }
        
        // Add related posts
        if (node.related && node.related.length > 0) {
          node.related.forEach(relatedRef => {
            const relatedPost = data.find(p => p.id === relatedRef.id);
            // Avoid duplicates
            if (relatedPost && !children.some(c => c.id === relatedPost.id)) {
              const relatedNode = buildHierarchy(relatedPost, level + 1, currentPath);
              if (relatedNode) {
                children.push(relatedNode);
              }
            }
          });
        }
        
        if (children.length > 0) {
          nodeData.children = children;
        }
      } else if ((node.children && node.children.length > 0) || (node.related && node.related.length > 0)) {
        // If node is collapsed but has children, add a collapsed indicator
        nodeData.hasCollapsedChildren = true;
      }
      
      return nodeData;
    };

    const hierarchyData = buildHierarchy(rootPost);
    
    // Create D3 hierarchy
    const root = d3.hierarchy(hierarchyData);
    
    // Calculate the maximum depth/width to adjust the layout
    const maxDepth = d3.max(root.descendants(), d => d.depth);
    
    // Create tree layout - using left-to-right orientation
    // with root node placed at the left side
    const treeLayout = d3.tree()
      .size([height - 120, width - 300]) // More space for labels
      .nodeSize([40, 200]) // Increased node size for better spacing
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));
    
    // Apply layout to hierarchy
    treeLayout(root);
    
    // Apply layout to hierarchy
    treeLayout(root);
    
    // Calculate initial position - place Root node at the left center
    const initialTransform = d3.zoomIdentity
      .translate(100, height / 2 - root.x)
      .scale(0.9);
      
    // Create curved links between nodes
    const linkGenerator = d3.linkHorizontal()
      .x(d => d.y) 
      .y(d => d.x);
    
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    // Color scale for section tags
    const colorScale = d3.scaleOrdinal(d3.schemeSet3);
    
    // Create node groups
    const nodeGroups = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('cursor', 'pointer');
    
    // Add circles for each node
    nodeGroups.append('circle')
      .attr('r', d => {
        if (d.data.is_decision) return 14;
        if (d.data.hasCollapsedChildren) return 12;
        return 10;
      })
      .attr('fill', d => {
        const sectionTag = d.data.tags.find(tag => tag.name && tag.name.startsWith('Section'));
        return sectionTag ? colorScale(sectionTag.name) : '#cccccc';
      })
      .style('stroke', d => d.data.is_decision ? '#FFD700' : (d.data.hasCollapsedChildren ? '#666' : 'none'))
      .style('stroke-width', d => d.data.is_decision ? '3px' : (d.data.hasCollapsedChildren ? '2px' : '0'))
      .on('click', (event, d) => {
        // Nodes only handle expansion/collapse, not navigation
        if (d.data.hasCollapsedChildren || (d.data.children && d.data.children.length > 0)) {
          // Expand/collapse only this specific node
          onToggleExpand(d.data.path);
          event.stopPropagation();
        }
      });
    
    // Add expand/collapse indicators for all nodes with children
    nodeGroups
      .filter(d => d.data.hasCollapsedChildren || (d.data.children && d.data.children.length > 0))
      .append('text')
      .attr('dy', '0.3em')
      .attr('dx', '0em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(d => d.data.hasCollapsedChildren ? '+' : (d.data.isExpanded ? '-' : '+'));
    
    // Add node labels with navigation functionality
    nodeGroups.append('text')
      .attr('dy', '0.3em')
      .attr('dx', d => 20) // Position text to the right of nodes
      .attr('text-anchor', 'start')
      .attr('fill', 'black')
      .attr('class', 'navigate')
      .style('font-size', '13px')
      .style('font-family', 'Arial, sans-serif')
      .style('cursor', 'pointer') // Pointer cursor indicates clickable
      .style('pointer-events', 'all') // Enable pointer events
      .text(d => {
        let title = d.data.name;
        // Limit text length based on depth to prevent overlap
        const maxLength = Math.max(15, 35 - d.depth * 5);
        if (title.length > maxLength) {
          title = title.substring(0, maxLength - 3) + '...';
        }
        return title;
      })
      .on('click', (event, d) => {
        // Text handles navigation
        if (d.data.slug) {
          onNodeClick(d.data.slug);
          event.stopPropagation();
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this).style('text-decoration', 'underline');
        // Show full title on hover
        if (d.data.name.length > 20) {
          const tooltip = g.append('g')
            .attr('class', 'tooltip')
            .attr('transform', `translate(${d.y + 20}, ${d.x - 30})`);
            
          tooltip.append('rect')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', d.data.name.length * 7 + 20)
            .attr('height', 30)
            .attr('fill', 'white')
            .attr('stroke', '#ddd')
            .attr('stroke-width', 1)
            .attr('opacity', 0.9);
            
          tooltip.append('text')
            .attr('x', 10)
            .attr('y', 20)
            .text(d.data.name)
            .style('font-family', 'Arial, sans-serif')
            .style('font-size', '12px');
        }
      })
      .on('mouseout', function() {
        d3.select(this).style('text-decoration', 'none');
        g.selectAll('.tooltip').remove();
      });
    
    // Add hover effect
    nodeGroups
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d => {
            const baseSize = d.data.is_decision ? 14 : (d.data.hasCollapsedChildren ? 12 : 10);
            return baseSize + 2;
          });
        
        // Show full title on hover if truncated
        const title = d.data.name;
        if (title.length > 25) {
          d3.select(this).append('title').text(title);
        }
      })
      .on('mouseout', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d => d.data.is_decision ? 14 : (d.data.hasCollapsedChildren ? 12 : 10));
        
        d3.select(this).select('title').remove();
      });
    
    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Export zoom ref for external control
    if (setZoomRef) {
      setZoomRef(zoom);
    }
    
    // Initial zoom to position the root node at the left side
    svg.call(zoom.transform, initialTransform);
    
    return () => {
      // Cleanup if needed
    };
  }, [data, rootNodeId, expandedNodes, onNodeClick, onToggleExpand, setZoomRef, containerDimensions]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={containerDimensions.height || "100%"}
      id="mindmap-svg"
      style={{ display: 'block' }} /* Ensures no extra spacing */
    />
  );
};

export default D3Renderer;
