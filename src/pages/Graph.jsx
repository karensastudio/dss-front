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
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const isAuthenticated = useIsAuthenticated()
  const authHeader = useAuthHeader();

  const navigate = useNavigate();

  const [data, setData] = useState({ nodes: [{ id: 0 }], links: [] });
  const [zoom, setZoom] = useState(1);
  const [distance, setDistance] = useState(-1000);

  const simulationRef = useRef(null);
  const dssGraphRef = useRef();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getUserGraphApi(authHeader());
        if (response.status === 'success') {
          setUserPosts(response.response.posts);
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
        if (isDecisionRelationEnabled) {
          if (node.is_decision) {
            nodes.push(node);
          }
        }
        else {
          nodes.push(node);
        }
      };

      const linksPather = (node) => {
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
                if (links.find((link) => link.source === node.id && link.target === child.id)) {
                  return;
                }
                if (links.find((link) => link.source === child.id && link.target === node.id)) {
                  return;
                }
                links.push({ source: node.id, target: child.id });
              });
            }
            if (node.children) {
              node.children.forEach((child) => {
                if (!child.is_decision) {
                  return;
                }
                if (links.find((link) => link.source === node.id && link.target === child.id)) {
                  return;
                }
                if (links.find((link) => link.source === child.id && link.target === node.id)) {
                  return;
                }
                links.push({ source: node.id, target: child.id });
              })
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
                  if (links.find((link) => link.source === node.id && link.target === relatedNode.id)) {
                    return;
                  }
                  if (links.find((link) => link.source === relatedNode.id && link.target === node.id)) {
                    return;
                  }
                  links.push({ source: node.id, target: relatedNode.id });
                }
              })
            });
          }
        }
        else {
          if (node.related) {
            node.related.forEach((child) => {
              if (links.find((link) => link.source === node.id && link.target === child.id)) {
                return;
              }
              if (links.find((link) => link.source === child.id && link.target === node.id)) {
                return;
              }
              links.push({ source: node.id, target: child.id });
            });
          }
          if (node.children) {
            node.children.forEach((child) => {
              if (links.find((link) => link.source === node.id && link.target === child.id)) {
                return;
              }
              if (links.find((link) => link.source === child.id && link.target === node.id)) {
                return;
              }
              links.push({ source: node.id, target: child.id });
            })
          }
        }
      };

      userPosts.forEach((rootNode) => nodePather(rootNode));
      userPosts.forEach((rootNode) => linksPather(rootNode));

      return { nodes, links };
    };

    const { nodes, links } = flattenData(userPosts);

    const centerX = width / 2;
    const centerY = height / 2;

    const angleToCoordinate = (angle, radius) => ({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });

    const numNodes = nodes.length;

    const anglePerNode = (2 * Math.PI) / numNodes;

    nodes.forEach((node, index) => {
      const angle = index * anglePerNode;

      const { x, y } = angleToCoordinate(angle, radius);

      node.x = x;
      node.y = y;
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(100).strength(1))
      .force('charge', d3.forceManyBody().strength(distance))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2));

    simulationRef.current = simulation;

    const link = svg
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'black')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1);

    const nodeGroup = svg
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

    nodeGroup
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        return d.is_decision ? '#4070FB' : '#9ca3af';
      }).on("mouseover", function (d) {
        d3.select(this).style("fill", "#f87171").style("stroke", "#fecaca").style("stroke-width", "2px");
        // change color of links
        d3.selectAll('line').filter(function (link) {
          return link.source.id === d.target.__data__.id || link.target.id === d.target.__data__.id;
        }).style("stroke", "#ef4444").style("stroke-width", "2px");
      })
      .on("mouseout", function (d) {
        d3.select(this).style("fill", (d.target.__data__.is_decision ? '#4070FB' : '#9ca3af')).style("stroke", "#dc2626").style("stroke-width", "0");
        // change color of links
        d3.selectAll('line').filter(function (link) {
          return link.source.id === d.target.__data__.id || link.target.id === d.target.__data__.id;
        }).style("stroke", "black").style("stroke-width", "1px");
      });

    nodeGroup
      .append('text')
      .attr('dy', '-2em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .attr('class', 'node-text')
      .text((d) => d.title.slice(0, 30));

    function ticked() {
      if (!isDragging) {
        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
      }
    }

    simulation.on('tick', ticked);

    return () => {
      simulation.stop();
    };
  }, [userPosts, distance, isTagRelationEnabled, isDecisionRelationEnabled, window.innerWidth, window.innerHeight]);

  return (
    <UserLayout pageTitle={'Graph'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-[16px] md:px-0">
          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3">
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