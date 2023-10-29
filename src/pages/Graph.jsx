import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useState } from "react";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { HiMinus, HiPlus } from "react-icons/hi";
import { ForceGraph2D } from 'react-force-graph';
import { getUserPostsApi } from "../api/userPost";
import { useAuthHeader } from "react-auth-kit";


export default function GraphPage() {
  const [isTagRelationEnabled, setTagRelationEnabled] = useState(false);
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);

  const authHeader = useAuthHeader();

  const generateGraphData = () => {
    const data = {
      nodes: [],
      links: []
    };

    userPosts.forEach(post => {
      // {
      //   "id": 41,
      //     "title": "B: Involving stakeholders",
      //       "priority": 0,
      //         "slug": "b-involving-stakeholders",
      //           "children": [
      //             {
      //               "id": 42,
      //               "title": "B1: Collaborative processes",
      //               "priority": 1,
      //               "slug": "b1-collaborative-processes",
      //               "children": [],
      //               "is_decision": null,
      //               "created_at": "2023-10-16T10:04:03.000000Z"
      //             },
      //             {
      //               "id": 43,
      //               "title": "B3: Stakeholder motivation + wide and deep engagement",
      //               "priority": 3,
      //               "slug": "b3-stakeholder-motivation-wide-and-deep-engagement",
      //               "children": [],
      //               "is_decision": null,
      //               "created_at": "2023-10-16T11:07:12.000000Z"
      //             }
      //           ],
      //             "is_decision": null,
      //               "created_at": "2023-10-16T10:00:26.000000Z"
      // },

      const postNode = {
        id: post.id,
        name: post.title,
        url: `/posts/${post.slug}`,
        group: 1
      };
      data.nodes.push(postNode);

      post.children.forEach(child => {
        const childNode = {
          id: child.id,
          name: child.title,
          url: `/posts/${child.slug}`,
          group: 2
        };
        data.nodes.push(childNode);

        const link = {
          source: post.id,
          target: child.id,
          value: 1
        };
        data.links.push(link);

        if (child.children.length > 0) {
          child.children.forEach(grandChild => {
            const grandChildNode = {
              id: grandChild.id,
              name: grandChild.title,
              url: `/posts/${grandChild.slug}`,
              group: 3
            };
            data.nodes.push(grandChildNode);

            const link = {
              source: child.id,
              target: grandChild.id,
              value: 1
            };
            data.links.push(link);
          });
        }
      }
      );
    });

    return data;
  }

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getUserPostsApi(authHeader());
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

  return (
    <UserLayout pageTitle={'Graph'} hideSidebar fullWidth>
      <div className="w-full bg-white border-y shadow-sm flex flex-col min-h-full grow">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3">
              <p className="text-neutral-900 text-sm font-semibold mb-1">Tag relation:</p>
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
            <div className="flex flex-col justify-center items-start py-3 pl-5">
              <p className="text-neutral-900 text-sm font-semibold mb-1">My decision relations:</p>
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
          </div>

          <div className="flex items-center justify-start divide-x gap-5">
            <div className="flex flex-col justify-center items-start py-3">
              <p className="text-neutral-900 text-sm font-semibold mb-1">Node ditance:</p>
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                >
                  <span className="sr-only">Previous</span>
                  <HiPlus className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                >
                  <span className="sr-only">Next</span>
                  <HiMinus className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>

            </div>
            <div className="flex flex-col justify-center items-start py-3 pl-5">
              <p className="text-neutral-900 text-sm font-semibold mb-1">Zoom:</p>
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                >
                  <span className="sr-only">Previous</span>
                  <BsZoomIn className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-4 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                >
                  <span className="sr-only">Next</span>
                  <BsZoomOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>

            </div>
          </div>

        </div>
        <div className="bg-black h-full flex items-center justify-center min-h-full grow" id="graph-container">
          <ForceGraph2D
            height={700}
            graphData={generateGraphData()}
            nodeAutoColorBy="group"
            nodeCanvasObjectMode={node => 'before'}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color;
              ctx.fillText(label, node.x, node.y);

              node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              const bckgDimensions = node.__bckgDimensions;
              bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
            }}
            linkColor={() => 'rgba(255, 255, 255, 0.2)'}
            linkWidth={1}
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={1}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleColor={() => '#fff'}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            linkDirectionalArrowColor={() => '#fff'}
            nodeLabel="name"
            onNodeHover={node => {
              graph.nodeColor(node.id === activeNode ? 'red' : 'rgba(255, 255, 255, 0.8)');
            }}

          />
        </div>
      </div>
    </UserLayout>
  );
}