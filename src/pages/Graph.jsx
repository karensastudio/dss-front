import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useRef, useState } from "react";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { HiMinus, HiPlus } from "react-icons/hi";
import { ForceGraph2D } from 'react-force-graph';
import { getUserGraphApi, getUserPostsApi } from "../api/userPost";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import * as d3 from 'd3';
import { useNavigate } from "react-router-dom";
import { CgSpinner } from "react-icons/cg";

export default function GraphPage() {
  const [isTagRelationEnabled, setTagRelationEnabled] = useState(false);
  const [isChildRelationDisabled, setIsChildRelationDisabled] = useState(false);
  const [isTagNodeEnabled, setIsTagNodeEnabled] = useState(false);
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tags, setTags] = useState([]);
  const [lastHoveredNode, setLastHoveredNode] = useState(null);


  const isAuthenticated = useIsAuthenticated()
  const authHeader = useAuthHeader();

  const navigate = useNavigate();

  const [data, setData] = useState({ nodes: [{ id: 0 }], links: [] });
  const [zoom, setZoom] = useState(1);
  const [distance, setDistance] = useState(-1000);

  const simulationRef = useRef(null);
  const dssGraphRef = useRef();

  // collect tags from posts with append posts to tags
  function collectTagsfromPosts(posts) {
    let tags = [];
    posts.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => {
          if (!tags.find((t) => t.id === tag.id)) {
            tags.push(tag);
          }
        })
      }
    })
    // push posts to tags
    tags.forEach((tag) => {
      tag.posts = posts.filter((post) => {
        if (post.tags) {
          return post.tags.find((t) => t.id === tag.id);
        }
      })
    })
    return tags;
  }

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getUserGraphApi(authHeader());
        if (response.status === 'success') {
          setUserPosts(response.response.posts);
          setTags(collectTagsfromPosts(response.response.posts));
          setError(null);
          setIsPostsLoading(false);
        } else {
          setError(response.message);
          setUserPosts([]);
          setIsPostsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setError('An unexpected error occurred.');
        setUserPosts([]);
        setIsPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, []);



  const dragstarted = (event, d) => {
    if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    setIsDragging(true);
  }

  const dragged = (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  }

  const dragended = (event, d) => {
    if (!event.active) simulationRef.current.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    setIsDragging(false);
  }

  function changeDistance(type) {
    if (type == 1) {
      setDistance(distance - 200)
    }
    if (type == -1) {
      setDistance(distance + 200)
    }
  }

  function changeZoom(type) {
    if (type == 1) {
      setZoom(zoom + 1)
    }
    if (type == -1 && zoom == 1) {
      setZoom(zoom - 1)
    }
  }

  

  useEffect(() => {
    if (!userPosts || userPosts.length === 0) {
      return;
    }

    // set height of #graph-svg to be the same as #graph-container
    document.getElementById('graph-svg').style.height = document.getElementById('graph-container').offsetHeight + 'px';

    const width = window.innerWidth;
    // get height of #graph-container 
    const height = document.getElementById('graph-container').offsetHeight;
    const radius = Math.min(width, height) / 2;

    // make sure to remove the old graph
    d3.select(dssGraphRef.current).selectAll('*').remove();

    const svg = d3.select(dssGraphRef.current);

    const flattenData = (userPosts) => {
      const nodes = [];
      const links = [];

      const nodePather = (node) => {
        if (isTagNodeEnabled && node.tags) {
          node.tags.forEach((tag) => {
            if (tag && tag.id) {  // Ensure the tag and tag ID exist
              const tagNode = nodes.find((n) => n.id === 'tag' + tag.id);
              if (!tagNode) {
                nodes.push({ id: 'tag' + tag.id, name: tag.name || `Tag ${tag.id}`, tags: [] });
              }
            }
          });
        }
        if (node && node.id && node.title) {
          if (isDecisionRelationEnabled) {
            if (node.is_decision) {
              nodes.push({ id: 'post' + node.id, ...node });  // Ensure consistent post node ID format
            }
          } else {
            nodes.push({ id: 'post' + node.id, ...node });  // Ensure consistent post node ID format
          }
        }
      };

      const linksPather = (node) => {
        if (node.tags && node.tags.length > 0) {
          node.tags.forEach((tag) => {
            // Find the corresponding tag node
            const tagNode = nodes.find((n) => n.id === 'tag' + tag.id);
            
            // Find the corresponding post node in the nodes array
            const postNodeInGraph = nodes.find((n) => n.id === 'post' + node.id);
    
            // Ensure both the post node and the tag node exist before creating the link
            if (tagNode && postNodeInGraph) {
              links.push({ source: 'post' + node.id, target: 'tag' + tag.id });
            }
          });
        }
        if (isDecisionRelationEnabled) {
          if (node.is_decision) {
            if (node.related) {
              node.related.forEach((child) => {
                // find child in nodes and check if it is decision
                const childNode = nodes.find((n) => n.id === child.id);
                if (!childNode) {
                  return;
                }
                if (!childNode.is_decision) {
                  return;
                }
                if (links.find((link) => link.source === 'post' + node.id && link.target === 'post' + child.id)) {
                  return;
                }
                if (links.find((link) => link.source === 'post' + child.id && link.target === 'post' + node.id)) {
                  return;
                }
                links.push({ source: 'post' + node.id, target: 'post' + child.id });
              });
            }
            if (!isChildRelationDisabled) {
              if (node.children) {
                node.children.forEach((child) => {
                  if (!child.is_decision) {
                    return;
                  }
                  if (links.find((link) => link.source === 'post' + node.id && link.target === 'post' + child.id)) {
                    return;
                  }
                  if (links.find((link) => link.source === 'post' + child.id && link.target === 'post' + node.id)) {
                    return;
                  }
                  links.push({ source: 'post' + node.id, target: 'post' + child.id });
                })
              }
            }
          }
        }
        else if (isTagRelationEnabled) {
          // // find by every tag if two node have same tag, they are related
          const tags = node.tags;
          if (tags) {
            tags.forEach((tag) => {
              const relatedNodes = nodes.filter((post) => {
                if (post.tags) {
                  return post.tags.find((t) => t.id === tag.id);
                }
              });
              // except itself
              relatedNodes.forEach((relatedNode) => {
                if (relatedNode.id !== node.id) {
                  if (links.find((link) => link.source === 'post' + node.id && link.target === 'post' + relatedNode.id)) {
                    return;
                  }
                  if (links.find((link) => link.source === 'post' + relatedNode.id && link.target === 'post' + node.id)) {
                    return;
                  }
                  links.push({ source: 'post' + node.id, target: 'post' + relatedNode.id });
                }
              })
            });
          }
        }
        else {
          if (node.related) {
            node.related.forEach((child) => {
              if (links.find((link) => link.source === 'post' + node.id && link.target === 'post' + child.id)) {
                return;
              }
              if (links.find((link) => link.source === 'post' + child.id && link.target === 'post' + node.id)) {
                return;
              }
              links.push({ source: 'post' + node.id, target: 'post' + child.id });
            });
          }
          if (!isChildRelationDisabled) {
            if (node.children) {
              node.children.forEach((child) => {
                if (links.find((link) => link.source === 'post' + node.id && link.target === 'post' + child.id)) {
                  return;
                }
                if (links.find((link) => link.source === 'post' + child.id && link.target === 'post' + node.id)) {
                  return;
                }
                links.push({ source: 'post' + node.id, target: 'post' + child.id });
              })
            }
          }
        }
      };

      userPosts.forEach((rootNode) => nodePather(rootNode));
      userPosts.forEach((rootNode) => linksPather(rootNode));
      tags.forEach((rootNode) => linksPather(rootNode));

      return { nodes, links };
    };

    const { nodes, links } = flattenData(userPosts);

    const sectionGroups = {};
    nodes.forEach(node => {
      const sectionTag = node.tags.find(tag => tag.name.startsWith("Section"));
      if (sectionTag) {
        if (!sectionGroups[sectionTag.name]) {
          sectionGroups[sectionTag.name] = [];
        }
        sectionGroups[sectionTag.name].push(node);
      }
    });

  const sectionNames = Object.keys(sectionGroups).sort(); // Sort sections alphabetically
  const sectionWidth = width / sectionNames.length; // Calculate section width

  // Position nodes within each section
  sectionNames.forEach((sectionName, sectionIndex) => {
    const nodesInSection = sectionGroups[sectionName];
    const sectionXStart = sectionIndex * sectionWidth;

    nodesInSection.forEach((node, nodeIndex) => {
      const nodeX = sectionXStart + (sectionWidth / nodesInSection.length) * nodeIndex;
      const nodeY = height; // You can adjust Y position as per your layout

      node.x = nodeX;
      node.y = nodeY;
    });
  });
    
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => (d.title ? 'post' + d.id : 'tag' + d.id)).distance(100).strength(1))
      .force('charge', d3.forceManyBody().strength(distance))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2));

    simulationRef.current = simulation;

    const g = svg.append('g');

    const link = g
    .selectAll('.link')
    .data(links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('stroke', 'black')
    .attr('stroke-opacity', 0.3)
    .attr('fill', 'none');

    const nodeGroup = g
      .selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node cursor-pointer')
      .on('click', (d) => navigate('/posts/' + d.target.__data__.slug))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );
    
    const zoom = d3.zoom()
      .scaleExtent([1, 10]) // Set minimum scale to 1 to prevent zooming out
      .on("zoom", (event) => {
          g.attr("transform", event.transform); // Apply transform to the group 'g'
      });
  
    svg.call(zoom);


    const sectionTags = new Set();
      nodes.forEach(node => {
        node.tags.forEach(tag => {
          if (tag.slug.startsWith("section")) {
            sectionTags.add(tag.name);
          }
        });
      });
      
      const sortedSectionTags = Array.from(sectionTags).sort();
      const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain([...sortedSectionTags]);


    nodeGroup
      .append('circle')
      .attr('r', 13)
      .attr('fill', (d) => {
        const sectionTag = d.tags.find(tag => tag.name.startsWith("Section"));
        if (sectionTag) {
          return colorScale(sectionTag.name);
        }
        return '#9ca3af'; // Default color if no relevant tags
      })
      .style('stroke', (d) => d.is_decision ? '#FFD700' : 'none') 
      .style('stroke-width', (d) => d.is_decision ? '4px' : '0'); 
    

      nodeGroup.selectAll('circle')
      .on("mouseover", function (event, d) {

        setLastHoveredNode(d);

        const fullTitle = d.title || `#${d.name}`;
        d3.select(this.parentNode) // Select the parent group (`<g>`) of the circle
          .append('title')
          .text(fullTitle);
        // Reduce the opacity of all nodes, links, and titles
        nodeGroup.selectAll('circle').transition().duration(500).style("opacity", 0.3);
        nodeGroup.selectAll('text').transition().duration(500).style("opacity", 0.3);
        link.transition().duration(500).style("opacity", 0.3);

        // Get all connected nodes
        const connectedNodes = new Set();
        links.forEach(link => {
          if (link.source === d || link.target === d) {
            connectedNodes.add(link.source);
            connectedNodes.add(link.target);
          }
        });

        // Increase the opacity of the hovered node, its connected links, connected nodes, and their titles
        // d3.select(this).style("opacity", 1); // Hovered node
        // nodeGroup.selectAll('text').filter(node => node === d || connectedNodes.has(node)).style("opacity", 1); // Titles
        // link.filter(l => l.source === d || l.target === d).style("opacity", 1); // Connected links
        // nodeGroup.selectAll('circle').filter(node => connectedNodes.has(node)).style("opacity", 1); // Connected nodes

        d3.select(this).transition().duration(500).style("opacity", 1);
        nodeGroup.selectAll('text').filter(node => node === d || connectedNodes.has(node)).transition().duration(500).style("opacity", 1);
        link.filter(l => l.source === d || l.target === d).transition().duration(500).style("opacity", 1);
        nodeGroup.selectAll('circle').filter(node => connectedNodes.has(node)).transition().duration(500).style("opacity", 1); // Connected nodes
      })
      .on("mouseout", function () {
        // Restore the opacity of all nodes, links, and titles
        if (!lastHoveredNode) return;  // If no node has been hovered yet, skip

        // Reduce opacity for all nodes except the last hovered node and its neighbors
        nodeGroup.selectAll('circle').transition().duration(500).style("opacity", (node) => {
          return node === lastHoveredNode || connectedNodes.has(node) ? 1 : 0.2;
        });
        
        // Same for text labels
        nodeGroup.selectAll('text').transition().duration(500).style("opacity", (node) => {
          return node === lastHoveredNode || connectedNodes.has(node) ? 1 : 0.2;
        });
      
        // Same for links
        link.transition().duration(500).style("opacity", (link) => {
          return link.source === lastHoveredNode || link.target === lastHoveredNode ? 1 : 0.2;
        });
      });

      nodeGroup
      .append('text')
      .attr('dy', '-2em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '12px') // Adjust the font size
      .style('font-family', 'Arial, sans-serif')
      .text((d) => {
        let title = d.title || `#${d.name}`;
        // Truncate the title if it's too long
        if (title.length > 20) {
          title = title.substring(0, 17) + '...';
        }
        return title;
      })
      .on('mouseover', function (event, d) {
        // Show full title in a tooltip on hover
        const fullTitle = d.title || `#${d.name}`;
        d3.select(this)
          .append('title')
          .text(fullTitle);
      });

    // change fill to green if d.name exist
    nodeGroup.selectAll('circle').filter(function (d) {
      return d.name;
    }).style("fill", "#10b981");
    
    function linkArc(d) {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    };
    
    function ticked() {
    // Update node and link positions
      link.attr('d', linkArc);
    
      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    };

    function highlightTutorialNode() {
    const tutorialNode = nodes.find(node => node.title === "Tutorial");
    const connectedNodes = new Set();

    if (tutorialNode) {
      // Find all links that are connected to 'Tutorial' node
      links.forEach(link => {
        if (link.source === tutorialNode || link.target === tutorialNode) {
          connectedNodes.add(link.source === tutorialNode ? link.target : link.source);
        }
      });

      // Add the 'Tutorial' node itself to the connected nodes set
      connectedNodes.add(tutorialNode);
    }

    // Set opacity for nodes and links
    nodeGroup.selectAll('circle')
      .style('opacity', d => connectedNodes.has(d) ? 1 : 0.3); // Highlight connected nodes, dim others

    nodeGroup.selectAll('text')
      .style('opacity', d => connectedNodes.has(d) ? 1 : 0.3); // Same for text labels

    link
      .style('opacity', d => connectedNodes.has(d.source) && connectedNodes.has(d.target) ? 1 : 0.3); // Dim other links
  }

    if (!userPosts || userPosts.length === 0) {
      return;
    }

    simulation.on('tick', ticked);


    const legend = d3.select(dssGraphRef.current)
    .append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(50, 50)'); 


    const legendItem = legend.selectAll('.legend-item')
      .data(colorScale.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 35})`); 

    legendItem.append('rect')
      .attr('width', 24)  // Increased rectangle size
      .attr('height', 24)
      .attr('fill', colorScale);

    legendItem.append('text')
      .attr('x', 34)  // Increased space between the box and text
      .attr('y', 12)  // Centered text vertically
      .attr('dy', '.35em')
      .style('font-size', '14px')  // Increased font size for better readability
      .style('font-family', 'Arial, sans-serif')
      .text(d => d);

    legend.append('text')
      .attr('x', 0)
      .attr('y', -20)  // Position above the legend items
      .style('font-size', '16px')  // Slightly larger for emphasis
      .style('font-weight', 'bold')  // Make it bold
      .text('Section Legend');

    legendItem
      .on('mouseover', function(event, sectionName) {
        // Highlight all nodes with the hovered section name
        nodeGroup.selectAll('circle').style('opacity', (d) => {
          const sectionTag = d.tags.find(tag => tag.name === sectionName);
          return sectionTag ? 1 : 0.2;  // Highlight nodes with this section
        });
    
        link.style('opacity', 0.2);  // Dim all links
      })
      .on('mouseout', function() {
        // Reset all nodes and links to full opacity
        nodeGroup.selectAll('circle').style('opacity', 1);
        nodeGroup.selectAll('text').style('opacity', 1);
        link.style('opacity', 1);
      });


      const sectionCounts = {};
      nodes.forEach(node => {
        const sectionTag = node.tags.find(tag => tag.name.startsWith("Section"));
        if (sectionTag) {
          if (!sectionCounts[sectionTag.name]) {
            sectionCounts[sectionTag.name] = 0;
          }
          sectionCounts[sectionTag.name]++;
        }
      });

      legendItem.append('text')
        .attr('x', 34)
        .attr('y', 12)
        .attr('dy', '.35em')
        .style('font-size', '14px')
        .style('font-family', 'Arial, sans-serif')


    

    highlightTutorialNode();

    return () => {
      simulation.stop();
    };
  }, [userPosts, distance, isTagRelationEnabled, isDecisionRelationEnabled, isTagNodeEnabled, isChildRelationDisabled, window.innerWidth, window.innerHeight]);

  return (
    <UserLayout pageTitle={'Graph'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-[16px] md:px-0">
          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">Show tag nodes:</p>
              <Switch
                checked={isTagNodeEnabled}
                onChange={setIsTagNodeEnabled}
                className={`${isTagNodeEnabled ? 'bg-green-500' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`${isTagNodeEnabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>

            {/* <div className="flex flex-col justify-center items-start py-3 pl-5">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">Tag relation:</p>
              <Switch
                checked={isTagRelationEnabled}
                onChange={setTagRelationEnabled}
                className={`${isTagRelationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`${isTagRelationEnabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>

            </div> */}

            <div className="pl-5 flex flex-col justify-center items-start py-3">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">Disable child relation:</p>
              <Switch
                checked={isChildRelationDisabled}
                onChange={setIsChildRelationDisabled}
                className={`${isChildRelationDisabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Enable notifications</span>
                <span
                  className={`${isChildRelationDisabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>

            </div>

            {
              isAuthenticated() && (
                <div className="flex flex-col justify-center items-start py-3 pl-5">
                  <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">My decision relations:</p>
                  <Switch
                    checked={isDecisionRelationEnabled}
                    onChange={setDecisionRelationEnabled}
                    className={`${isDecisionRelationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                  >
                    <span className="sr-only">Enable notifications</span>
                    <span
                      className={`${isDecisionRelationEnabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>

                </div>
              )
            }
          </div>

          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">Node ditance:</p>
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => changeDistance(1)}
                >
                  <span className="sr-only">Plus</span>
                  <HiPlus className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => changeDistance(-1)}
                >
                  <span className="sr-only">Minus</span>
                  <HiMinus className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>

            </div>
            {/* <div className="flex flex-col justify-center items-start py-3 pl-5">
              <p className="text-neutral-900 text-sm font-semibold mb-1">Zoom:</p>
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => changeZoom(1)}

                >
                  <span className="sr-only">Out</span>
                  <BsZoomIn className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => changeZoom(-1)}
                >
                  <span className="sr-only">In</span>
                  <BsZoomOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>

            </div> */}
          </div>

        </div>

        <div className="bg-gray-100 h-full flex items-center justify-center min-h-full grow" id="graph-container">
          {
            isPostsLoading ? (
              // spinner
              <CgSpinner className="animate-spin text-[48px] text-blue-600" />
            ) : error ? (
              <p className="text-xl text-blue-600 font-bold">Error: {error}</p>
            ) : userPosts.length === 0 ? (
              <p>No posts found.</p>
            ) : <>
              <svg ref={dssGraphRef} width="100%" height={document.getElementById('graph-container')?.offsetHeight ? document.getElementById('graph-container')?.offsetHeight : 750} id="graph-svg" />
            </>
          }
        </div>
      </div>
    </UserLayout>
  );
}