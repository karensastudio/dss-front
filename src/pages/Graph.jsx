import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useRef, useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";
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

  const isAuthenticated = useIsAuthenticated();
  const authHeader = useAuthHeader();

  const navigate = useNavigate();

  const [distance, setDistance] = useState(-1000);

  const simulationRef = useRef(null);
  const dssGraphRef = useRef();

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

  function changeDistance(type) {
    if (type === 1) {
      setDistance(prevDistance => {
        const newDistance = Math.min(prevDistance + 200, -200);
        updateSimulation(newDistance);
        return newDistance;
      });
    }
    if (type === -1) {
      setDistance(prevDistance => {
        const newDistance = Math.max(prevDistance - 200, -2000);
        updateSimulation(newDistance);
        return newDistance;
      });
    }
  }

  function updateSimulation(newDistance) {
    if (simulationRef.current) {
      simulationRef.current
        .force('charge', d3.forceManyBody().strength(newDistance))
        .alpha(1)
        .restart();
    }
  }

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

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => 'post' + d.id).distance(100).strength(1))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));



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
      .on('click', (d) => navigate('/posts/' + d.target.__data__.slug));

    const zoom = d3
      .zoom()
      .scaleExtent([0.4, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const sectionTags = new Set();
    nodes.forEach((node) => {
      node.tags.forEach((tag) => {
        if (tag.slug.startsWith('section')) {
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
        const sectionTag = d.tags.find((tag) => tag.name.startsWith('Section'));
        if (sectionTag) {
          return colorScale(sectionTag.name);
        }
        return '#9ca3af';
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
      const dr = Math.sqrt(dx * dx + dy * dy);
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    }

    function ticked() {
      link.attr('d', linkArc);
      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
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

    const legend = d3
      .select(dssGraphRef.current)
      .append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(50, 50)');

    const legendItem = legend
      .selectAll('.legend-item')
      .data(colorScale.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 35})`)
      .style('cursor', 'pointer');  // Add cursor style to indicate clickable

    legendItem.append('rect')
      .attr('width', 24)
      .attr('height', 24)
      .attr('fill', colorScale);

    legendItem.append('text')
      .attr('x', 34)
      .attr('y', 12)
      .attr('dy', '.35em')
      .style('font-size', '14px')
      .style('font-family', 'Arial, sans-serif')
      .text((d) => d);


    function highlightSection(sectionName) {
      nodeGroup.selectAll('circle').style('opacity', (d) => {
        const sectionTag = d.tags.find((tag) => tag.name === sectionName);
        return sectionTag ? 1 : 0.2;
      });
      nodeGroup.selectAll('text').style('opacity', (d) => {
        const sectionTag = d.tags.find((tag) => tag.name === sectionName);
        return sectionTag ? 1 : 0.2;
      });
      link.style('opacity', 0.2);
    }

    legendItem.on('click', function(event, sectionName) {
      if (selectedSection === sectionName) {
        setSelectedSection(null);
        resetGraph();
      } else {
        setSelectedSection(sectionName);
        highlightSection(sectionName);
      }
      event.stopPropagation();  // Prevent the click from propagating to the SVG
    });

    svg.on('click', () => {
      setSelectedSection(null);
      resetGraph();
    });
    
    // Visual feedback for selected legend item
    legendItem.select('rect')
      .style('stroke', (d) => selectedSection === d ? '#000' : 'none')
      .style('stroke-width', 2);


    function resetGraph() {
      nodeGroup.selectAll('circle').style('opacity', 1);
      nodeGroup.selectAll('text').style('opacity', 1);
      link.style('opacity', 1);
    }

    highlightTutorialNode();

    return () => {
      updateSimulation(distance);
      simulation.stop();
    };
  }, [userPosts, distance, isDecisionRelationEnabled, window.innerWidth, window.innerHeight]);

  return (
    <UserLayout pageTitle={'Graph'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-[16px] md:px-0">
          <div className="flex items-center justify-start divide-x gap-5">
            {isAuthenticated() && (
              <div className="flex flex-col justify-center items-start py-3 pl-5">
                <p className="text-neutral-900 text-xs md:text-sm font-semibold mb-1">
                  My decision relations:
                </p>
                <Switch
                  checked={isDecisionRelationEnabled}
                  onChange={setDecisionRelationEnabled}
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
          </div>
        </div>

        <div
          className="bg-gray-100 h-full flex items-center justify-center min-h-full grow"
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
