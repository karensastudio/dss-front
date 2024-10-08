import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useRef, useState, useCallback } from "react";
import { HiMinus, HiPlus, HiZoomIn, HiZoomOut } from "react-icons/hi";
import { getUserGraphApi } from "../api/userPost";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import * as d3 from 'd3';
import { useNavigate } from "react-router-dom";
import { CgSpinner } from "react-icons/cg";

export default function GraphPage() {
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);



  const [tags, setTags] = useState([]);
  const [lastHoveredNode, setLastHoveredNode] = useState(null);

  const [mainPosts, setMainPosts] = useState([]);

  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();

  const navigate = useNavigate();

  const [distance, setDistance] = useState(-1000);

  const simulationRef = useRef(null);
  const dssGraphRef = useRef();
  const zoomRef = useRef(null);

  const zoomStep = 0.2;  // Define the zoom step


  const handleZoom = (zoomIn) => {
    const svg = d3.select(dssGraphRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
    const newScale = zoomIn 
      ? currentTransform.k * (1 + zoomStep) 
      : currentTransform.k / (1 + zoomStep);
  
    if (zoomRef.current) {
      svg.transition().duration(300).call(
        zoomRef.current.transform,
        currentTransform.scale(newScale / currentTransform.k)
      );
    }
  };

  // Collect tags from posts and append posts to tags
  function collectTagsfromPosts(posts) {
    let tags = [];
    posts.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => {
          if (!tags.find((t) => t.id === tag.id)) {
            tags.push(tag);
          }
        });
      }
    });
    // Attach posts to tags
    tags.forEach((tag) => {
      tag.posts = posts.filter((post) => {
        if (post.tags) {
          return post.tags.find((t) => t.id === tag.id);
        }
      });
    });
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

  const changeDistance = (type) => {
    setDistance(prevDistance => {
      let newDistance;
      if (type === 1) {
        newDistance = Math.min(prevDistance + 200, -200);
      } else {
        newDistance = Math.max(prevDistance - 200, -2000);
      }
      updateSimulationWithoutZoomChange(newDistance);
      return newDistance;
    });
  };

  const updateSimulationWithoutZoomChange = (newDistance) => {
    const svg = d3.select(dssGraphRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
  
    if (simulationRef.current) {
      simulationRef.current
        .force('charge', d3.forceManyBody().strength(d => d.title === 'Tutorial' ? 0 : newDistance))
        .alpha(1)
        .restart();
    }
  
    // Trigger a re-render of the graph
    setUserPosts([...userPosts]);
  
    // After the graph updates, restore the zoom state
    setTimeout(() => {
      if (zoomRef.current && currentTransform) {
        svg.call(zoomRef.current.transform, currentTransform);
      }
    }, 0);
  };

  // function updateSimulation(newDistance) {
  //   if (simulationRef.current) {
  //     simulationRef.current
  //       .force('charge', d3.forceManyBody().strength(newDistance))
  //       .alpha(1)
  //       .restart();
  //   }
  // };

  const updateSimulation = useCallback((newDistance) => {
    if (simulationRef.current) {
      simulationRef.current
        .force('charge', d3.forceManyBody().strength(newDistance))
        .alpha(1)
        .restart();
    }
  }, []);

  useEffect(() => {
    if (!userPosts || userPosts.length === 0) {
      return;
    }

    // Set height of #graph-svg to be the same as #graph-container
    document.getElementById('graph-svg').style.height = document.getElementById('graph-container').offsetHeight + 'px';

    const width = window.innerWidth;
    const height = document.getElementById('graph-container').offsetHeight;

    // Remove the old graph
    d3.select(dssGraphRef.current).selectAll('*').remove();

    const svg = d3.select(dssGraphRef.current);

    const graphGroup = svg.append('g').attr('class', 'graph-content');

    const flattenData = (userPosts) => {
      const nodes = [];
      const links = [];

      const nodePather = (node) => {
        if (node && node.id && node.title) {
          if (isDecisionRelationEnabled) {
            if (node.is_decision) {
              nodes.push({ id: 'post' + node.id, ...node });
            }
          } else {
            nodes.push({ id: 'post' + node.id, ...node });
          }
        }
      };

      const linksPather = (node) => {
        if (node.tags && node.tags.length > 0) {
          node.tags.forEach((tag) => {
            const tagNode = nodes.find((n) => n.id === 'tag' + tag.id);
            const postNodeInGraph = nodes.find((n) => n.id === 'post' + node.id);

            if (tagNode && postNodeInGraph) {
              links.push({ source: 'post' + node.id, target: 'tag' + tag.id });
            }
          });
        }
        if (isDecisionRelationEnabled) {
          if (node.is_decision) {
            if (node.related) {
              node.related.forEach((child) => {
                const childNode = nodes.find((n) => n.id === child.id);
                if (!childNode || !childNode.is_decision) {
                  return;
                }
                if (
                  links.find(
                    (link) =>
                      (link.source === 'post' + node.id && link.target === 'post' + child.id) ||
                      (link.source === 'post' + child.id && link.target === 'post' + node.id)
                  )
                ) {
                  return;
                }
                links.push({ source: 'post' + node.id, target: 'post' + child.id });
              });
            }
            if (node.children) {
              node.children.forEach((child) => {
                if (!child.is_decision) {
                  return;
                }
                if (
                  links.find(
                    (link) =>
                      (link.source === 'post' + node.id && link.target === 'post' + child.id) ||
                      (link.source === 'post' + child.id && link.target === 'post' + node.id)
                  )
                ) {
                  return;
                }
                links.push({ source: 'post' + node.id, target: 'post' + child.id });
              });
            }
          }
        } else {
          if (node.related) {
            node.related.forEach((child) => {
              if (
                links.find(
                  (link) =>
                    (link.source === 'post' + node.id && link.target === 'post' + child.id) ||
                    (link.source === 'post' + child.id && link.target === 'post' + node.id)
                )
              ) {
                return;
              }
              links.push({ source: 'post' + node.id, target: 'post' + child.id });
            });
          }
          if (node.children) {
            node.children.forEach((child) => {
              if (
                links.find(
                  (link) =>
                    (link.source === 'post' + node.id && link.target === 'post' + child.id) ||
                    (link.source === 'post' + child.id && link.target === 'post' + node.id)
                )
              ) {
                return;
              }
              links.push({ source: 'post' + node.id, target: 'post' + child.id });
            });
          }
        }
      };

      userPosts.forEach((rootNode) => nodePather(rootNode));
      userPosts.forEach((rootNode) => linksPather(rootNode));

      return { nodes, links };
    };

    const { nodes, links } = flattenData(userPosts);

    function hierarchicalCircularForce(nodes, links, center, radius) {
  const tutorialNode = nodes.find(n => n.title === 'Tutorial');
  const mainPosts = new Set(links
    .filter(l => l.source === tutorialNode || l.target === tutorialNode)
    .flatMap(l => [l.source, l.target])
    .filter(n => n !== tutorialNode)
  );

  return function force(alpha) {
    nodes.forEach(node => {
      if (node === tutorialNode) {
        // Keep Tutorial node at center
        node.x = center.x;
        node.y = center.y;
      } else if (mainPosts.has(node)) {
        // Position main posts in a circle around Tutorial
        const angle = (Array.from(mainPosts).indexOf(node) / mainPosts.size) * 2 * Math.PI;
        const targetX = center.x + Math.cos(angle) * radius;
        const targetY = center.y + Math.sin(angle) * radius;
        node.x += (targetX - node.x) * alpha;
        node.y += (targetY - node.y) * alpha;
      } else {
        // Move other nodes outward
        const dx = node.x - center.x;
        const dy = node.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          const targetDistance = radius * 2;
          const factor = ((targetDistance - distance) / distance) * alpha;
          node.x += dx * factor;
          node.y += dy * factor;
        }
      }
    });
  };
}

// Modify your existing simulation setup
    const center = { x: width / 2, y: height / 2 };
    const innerRadius = Math.min(width, height) * 0.2; // Adjust as needed


    const simulation = d3
    .forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => 'post' + d.id).distance(100).strength(0.3))
    .force('charge', d3.forceManyBody().strength(d => d.title === 'Tutorial' ? 0 : distance))
    .force('collision', d3.forceCollide().radius(30))
    .force('hierarchical', hierarchicalCircularForce(nodes, links, center, innerRadius))
    .alphaDecay(0.01)
    .alphaMin(0.001);



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

    const mainPostTitles = userPosts
      .filter(post => /^[A-Z]:/.test(post.title))
      .map(post => post.title)
      .sort((a, b) => a.localeCompare(b));;
    setMainPosts(mainPostTitles);

    

    const nodeGroup = g
      .selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node cursor-pointer')
      .on('click', (d) => navigate('/posts/' + d.target.__data__.slug));

    const zoom = d3
      .zoom()
      .scaleExtent([0.4, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    if (zoomRef.current.storedTransform) {
      svg.call(zoom.transform, zoomRef.current.storedTransform);
    }


    const sectionTags = new Set();
    nodes.forEach((node) => {
      node.tags.forEach((tag) => {
        if (tag.slug.startsWith('section')) {
          sectionTags.add(tag.name);
        }
      });
    });

    const sortedSectionTags = Array.from(sectionTags).sort();
    const colorScale = d3.scaleOrdinal(d3.schemeSet3).domain(sortedSectionTags);





    

    nodeGroup
      .append('circle')
      .attr('r', 13)
      .attr('fill', (d) => {
        const sectionTag = d.tags.find((tag) => tag.name.startsWith('Section'));
        if (sectionTag) {
          return colorScale(sectionTag.name);
        }
        return '#cccccc';
      })
      .style('stroke', (d) => (d.is_decision ? '#FFD700' : 'none'))
      .style('stroke-width', (d) => (d.is_decision ? '4px' : '0'))
      .on('mouseover', function (event, d) {
        setLastHoveredNode(d);

        const fullTitle = d.title || `#${d.name}`;
        d3.select(this.parentNode)
          .append('title')
          .text(fullTitle);
        nodeGroup.selectAll('circle').transition().duration(500).style('opacity', 0.3);
        nodeGroup.selectAll('text').transition().duration(500).style('opacity', 0.3);
        link.transition().duration(500).style('opacity', 0.3);

        const connectedNodes = new Set();
        links.forEach((link) => {
          if (link.source === d || link.target === d) {
            connectedNodes.add(link.source);
            connectedNodes.add(link.target);
          }
        });

        d3.select(this).transition().duration(500).style('opacity', 1);
        nodeGroup
          .selectAll('text')
          .filter((node) => node === d || connectedNodes.has(node))
          .transition()
          .duration(500)
          .style('opacity', 1);
        link
          .filter((l) => l.source === d || l.target === d)
          .transition()
          .duration(500)
          .style('opacity', 1);
        nodeGroup
          .selectAll('circle')
          .filter((node) => connectedNodes.has(node))
          .transition()
          .duration(500)
          .style('opacity', 1);
      })
      .on('mouseout', function () {
        nodeGroup.selectAll('circle').transition().duration(500).style('opacity', 1);
        nodeGroup.selectAll('text').transition().duration(500).style('opacity', 1);
        link.transition().duration(500).style('opacity', 1);
      });

    nodeGroup
      .append('text')
      .attr('dy', '-2em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .text((d) => {
        let title = d.title || `#${d.name}`;
        if (title.length > 20) {
          title = title.substring(0, 17) + '...';
        }
        return title;
      })
      .on('mouseover', function (event, d) {
        const fullTitle = d.title || `#${d.name}`;
        d3.select(this).append('title').text(fullTitle);
      });

    nodeGroup
      .selectAll('circle')
      .filter(function (d) {
        return d.name;
      })
      .style('fill', '#10b981');

    function linkArc(d) {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 2; // Increase this multiplier for more pronounced curves
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    }

    function ticked() {
      link.attr('d', linkArc);
      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
    }

    

    function highlightTutorialNode() {
      const tutorialNode = nodes.find((node) => node.title === 'Tutorial');
      const connectedNodes = new Set();

      if (tutorialNode) {
        links.forEach((link) => {
          if (link.source === tutorialNode || link.target === tutorialNode) {
            connectedNodes.add(link.source === tutorialNode ? link.target : link.source);
          }
        });
        connectedNodes.add(tutorialNode);
      }

      nodeGroup
        .selectAll('circle')
        .style('opacity', (d) => (connectedNodes.has(d) ? 1 : 0.3));
      nodeGroup
        .selectAll('text')
        .style('opacity', (d) => (connectedNodes.has(d) ? 1 : 0.3));
      link.style('opacity', (d) =>
        connectedNodes.has(d.source) && connectedNodes.has(d.target) ? 1 : 0.3
      );
    }

    simulation.on('tick', ticked);

    const legendWidth = 250;
    const legendPadding = 10;
    const itemSpacing = 40; 
    const legendContainer = svg
      .append('g')
      .attr('class', 'legend-container')
      .attr('transform', `translate(${legendPadding}, ${legendPadding})`);


      function wrap(text, width) {
        text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.2, // ems
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", 34).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width - 40) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", 34).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });
      }

    const legendHeight = mainPostTitles.length * itemSpacing + legendPadding * 2;

    // Add a semi-transparent background to the legend
    legendContainer
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('rx', 5)
      .attr('ry', 5);

    // Create legend items
    const legend = legendContainer
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendPadding}, ${legendPadding})`);

    const legendItem = legend
      .selectAll('.legend-item')
      .data(mainPostTitles)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * itemSpacing})`)
      .style('cursor', 'pointer');

    legendItem
      .append('rect')
      .attr('width', 24)
      .attr('height', 24)
      .attr('fill', (d) => {
        const sectionTag = userPosts.find(post => post.title === d)?.tags.find(tag => tag.name.startsWith('Section'));
        return sectionTag ? colorScale(sectionTag.name) : '#9ca3af';
      });

    legendItem
      .append('text')
      .attr('x', 34)
      .attr('y', 12)
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .text((d) => d)
      .call(wrap, legendWidth - 40);

      function highlightMainPostSection(mainPostTitle) {
        const selectedPost = userPosts.find(post => post.title === mainPostTitle);
        const selectedSectionTag = selectedPost?.tags.find(tag => tag.name.startsWith('Section'))?.name;
  
        if (!selectedSectionTag) return;
  
        g.selectAll('.node')
          .style('opacity', (d) => {
            const nodeSectionTag = d.tags.find(tag => tag.name.startsWith('Section'))?.name;

            return nodeSectionTag === selectedSectionTag ? 1 : 0.2;
          });
  
          link.style('opacity', (d) => {
            const sourceSectionTag = d.source.tags.find(tag => tag.name.startsWith('Section'))?.name;
            const targetSectionTag = d.target.tags.find(tag => tag.name.startsWith('Section'))?.name;
            // Only show edge at full opacity if both nodes are in the selected section
            return (sourceSectionTag === selectedSectionTag && targetSectionTag === selectedSectionTag) ? 1 : 0.1;
          });
      }
  
      function resetGraph() {
        g.selectAll('.node').style('opacity', 1);
        link.style('opacity', 1);
      }
  
      legendItem.on('click', function(event, mainPostTitle) {
        event.stopPropagation();
        if (selectedSection === mainPostTitle) {
          setSelectedSection(null);
          resetGraph();
        } else {
          setSelectedSection(mainPostTitle);
          highlightMainPostSection(mainPostTitle);
        }
        updateLegendSelection();
      });
  
      svg.on('click', () => {
        setSelectedSection(null);
        resetGraph();
        updateLegendSelection();
      });
  
      function updateLegendSelection() {
        legendItem.select('rect')
          .style('stroke', (d) => selectedSection === d ? '#000' : 'none')
          .style('stroke-width', 2);
      }
  
      // Initial call to set up legend selection
      updateLegendSelection();

    highlightTutorialNode();

    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth;
      const newHeight = document.getElementById('graph-container').offsetHeight;
      const newCenter = { x: newWidth / 2, y: newHeight / 2 };
      const newInnerRadius = Math.min(newWidth, newHeight) * 0.2;

      svg.attr('width', newWidth).attr('height', newHeight);
      simulation.force('hierarchical', hierarchicalCircularForce(nodes, links, newCenter, newInnerRadius));
      simulation.alpha(1).restart();
    });

    return () => {
      zoomRef.current.storedTransform = d3.zoomTransform(svg.node());
      updateSimulation(distance);
      simulation.stop();
    };
  }, [userPosts, isDecisionRelationEnabled, window.innerWidth, window.innerHeight, distance]);


  const updateGraphWithoutZoomChange = () => {
    const svg = d3.select(dssGraphRef.current);
    const currentTransform = d3.zoomTransform(svg.node());
  
    // Trigger a re-render of the graph
    setUserPosts([...userPosts]);
  
    // After the graph updates, restore the zoom state
    setTimeout(() => {
      if (zoomRef.current && currentTransform) {
        svg.call(zoomRef.current.transform, currentTransform);
      }
    }, 0);
  };

  return (
    <UserLayout pageTitle={'Graph'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-[16px] md:px-0">
          <div className="flex items-center justify-start divide-x gap-5">
            {isAuthenticated() && (
              <div className="flex flex-col justify-center items-start py-3 pl-5">
                <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                  Only show my decisions:
                </p>
                <Switch
                  checked={isDecisionRelationEnabled}
                  onChange={(checked) => {
                    setDecisionRelationEnabled(checked);
                    updateGraphWithoutZoomChange();
                  }}
                  className={`${
                    isDecisionRelationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Enable notifications</span>
                  <span
                    className={`${
                      isDecisionRelationEnabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            )}
          </div>

          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                Nodes distance:
              </p>
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => changeDistance(1)}
                >
                  <span className="sr-only">Minus</span>
                  <HiMinus className="h-4 w-4" aria-hidden="true" />
                  
                </button>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => changeDistance(-1)}
                >
                  <span className="sr-only">Plus</span>
                  <HiPlus className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            </div>
            <div className="flex flex-col justify-center items-start py-3 pl-5">
              <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                Zoom:
              </p>
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => handleZoom(false)}
                >
                  <span className="sr-only">Zoom Out</span>
                  <HiZoomOut className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                  onClick={() => handleZoom(true)}
                >
                  <span className="sr-only">Zoom In</span>
                  <HiZoomIn className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            </div>
          </div>
          
        </div>

        <div
          className="bg-gray-50 h-full flex items-center justify-center min-h-full grow"
          id="graph-container"
        >
          {isPostsLoading ? (
            <CgSpinner className="animate-spin text-[48px] text-blue-600" />
          ) : error ? (
            <p className="text-xl text-blue-600 font-bold">Error: {error}</p>
          ) : userPosts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <>
              <svg
                ref={dssGraphRef}
                width="100%"
                height={
                  document.getElementById('graph-container')?.offsetHeight
                    ? document.getElementById('graph-container')?.offsetHeight
                    : 750
                }
                id="graph-svg"
              />
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
