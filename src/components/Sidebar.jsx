import { Disclosure, Transition } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { BsSearch, BsChevronUp, BsBookmarkFill } from "react-icons/bs";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { getUserPostsApi } from "../api/userPost";
import { getDecisionsApi } from "../api/decision";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { CgSpinner } from "react-icons/cg";
import * as d3 from 'd3';
import { getBookmarksApi } from "../api/bookmark";
import { searchAPI } from "../api/search";


export function SearchSection() {
    const { isLightMode } = useTheme();
    const authHeader = useAuthHeader();
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isPostsLoading, setIsPostsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            setIsPostsLoading(true);
            const response = await searchAPI(authHeader(), searchValue);
            if (response.status === 'success') {
                setSearchResults(response.response.posts);
                setError(null);
                setIsPostsLoading(false);
            } else {
                setError(response.message);
                setSearchResults([]);
                setIsPostsLoading(false);
            }
        } catch (error) {
            console.error(error);
            setError('An unexpected error occurred.');
            setSearchResults([]);
            setIsPostsLoading(false);
        }
    };

    const handleClickOnPost = async (result) => {
        const resultsWithHighlight = searchResults.map((s) => {
            return {
                ...s,
                highlight: s.id === result.id
            };
        });
        setSearchResults(resultsWithHighlight);
        navigate(`/posts/${result.slug}`);
    };

    const handleOnEnterSearch = (e) => {
        if(e.key == 'Enter'){
            handleSearch();
        }
    }

    return (
        <div className="flex flex-col space-y-[16px]">

            <div className="flex py-[32px] items-center justify-between space-x-[16px]">
                <input
                    type="search"
                    placeholder="Search for content"
                    className="w-full bg-transparent rounded-none focus-within:outline-none text-white py-[15px] text-[20px] border-b-2 border-b-white border-opacity-25 focus:border-opacity-100 leading-[32px] font-medium"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyUp={(e) => handleOnEnterSearch(e)}
                />

                <button type="button" className="ml-auto flex bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium" onClick={handleSearch}>
                    Search
                </button>
            </div>

            {error && (
                <p className="text-red-500">{error}</p>
            )}

            {
                isPostsLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <CgSpinner className="text-white text-[48px] animate-spin" />
                    </div>
                ) :
                    searchResults?.length > 0 && (
                        <div className="flex flex-col space-y-[16px]">
                            {searchResults?.map((result) => (
                                <div key={result.id} className={`text-[16px] leading-[24px] cursor-pointer ${result.highlight ? 'text-[#0071FF]' : 'text-white'}`}
                                    onClick={() => handleClickOnPost(result)}
                                >
                                    {result.title}
                                </div>
                            ))}
                        </div>
                    )}
        </div>
    );
}

export function ListOfContentSection() {
    const { isLightMode } = useTheme();
    const [userPosts, setUserPosts] = useState([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [highlightedPost, setHighlightedPost] = useState(null);
    const authHeader = useAuthHeader();
    const navigate = useNavigate();

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

    const handlePostClick = (clickedPost) => {
        setHighlightedPost(clickedPost);
        navigate(`/posts/${clickedPost.slug}`);
    };

    return (
        <div className="flex flex-col space-y-[16px] mt-[10px]">
            {isPostsLoading ? (
                <div className="flex items-center justify-center py-10">
                    <CgSpinner className="text-white text-[48px] animate-spin" />
                </div>
            ) : userPosts.map((category) => (
                <Disclosure key={category.id}>
                    {({ open = true }) => (
                        <section className={`px-[25px] py-[16px] rounded-[12px] ${isLightMode ? 'bg-white text-[#111315]' : 'bg-[#41474D] text-white'}`}>
                            <Disclosure.Button className="flex w-full justify-between items-center text-left text-[16px] font-medium">
                                <span>{category.title}</span>
                                <div className="bg-[#0071FF] rounded-full p-[14px]">
                                    <BsChevronUp className={`${open ? 'rotate-180 transform' : 'rotate-90'} text-[16px] text-white`}/>
                                </div>
                            </Disclosure.Button>
                            <Transition
                                show={open}
                                enter="transition duration-100 ease-out"
                                enterFrom="transform scale-95 opacity-0"
                                enterTo="transform scale-100 opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform scale-100 opacity-100"
                                leaveTo="transform scale-95 opacity-0"
                            >
                                <Disclosure.Panel className="px-[27px] mt-[10px]">
                                    <div className="flex flex-col space-y-[16px]">
                                        <span
                                            key={category.id}
                                            className={`text-[16px] leading-[24px] cursor-pointer ${
                                                highlightedPost?.id === category.id ? 'text-[#0071FF]' : isLightMode ? 'text-[#111315]' : 'text-white'
                                            }`}
                                            onClick={() => handlePostClick(category)}
                                            >
                                            Introduction
                                        </span>
                                        {category.children.map((post) => (
                                            <span
                                            key={post.id}
                                            className={`text-[16px] leading-[24px] cursor-pointer ${
                                              highlightedPost?.id === post.id ? 'text-[#0071FF]' : isLightMode ? 'text-[#111315]' : 'text-white'
                                            }`}
                                            onClick={() => handlePostClick(post)}
                                          >
                                            {post.title}
                                            </span>
                                        ))}
                                    </div>
                                </Disclosure.Panel>
                            </Transition>
                        </section>
                    )}
                </Disclosure>
            ))}

            {error && (
                <div className="text-red-500">{error}</div>
            )}
        </div>
    );
}

export function BookmarkSection() {
    const { isLightMode } = useTheme();
    const [bookmarks, setBookmarks] = useState([]);
    const [error, setError] = useState(null);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [highlightedBookmark, setHighlightedBookmark] = useState(null);
    const authHeader = useAuthHeader();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const response = await getBookmarksApi(authHeader());
                if (response.status === 'success') {
                    setBookmarks(response.response.posts);
                    setError(null);
                    setIsPostsLoading(false);
                } else {
                    setError(response.message);
                    setBookmarks([]);
                    setIsPostsLoading(false);
                }
            } catch (error) {
                console.error(error);
                setError('An unexpected error occurred.');
                setBookmarks([]);
                setIsPostsLoading(false);
            }
        };

        fetchBookmarks();
    }, []);

    const handleBookmarkClick = async (bookmark) => {
        setHighlightedBookmark(bookmark);
        navigate(`/posts/${bookmark.slug}`)

    };

    return (
        <div className="flex flex-col space-y-[8px] mt-[10px]">
            {isPostsLoading ? (
                <div className="flex items-center justify-center py-10">
                    <CgSpinner className="text-white text-[48px] animate-spin" />
                </div>
            ) : bookmarks?.map((bookmark) => (
                    <a
                    key={bookmark.id}
                    className={`text-[16px] leading-[24px] cursor-pointer flex items-center ${
                        highlightedBookmark?.id === bookmark.id
                        ? 'text-[#0071FF]'
                        : isLightMode
                        ? 'text-[#111315]'
                        : 'text-white'
                    }`}
                    onClick={() => handleBookmarkClick(bookmark)}
                    >
                    <BsBookmarkFill className="mr-[10px]" />
                    <span>{bookmark.title}</span>
                </a>
            ))}

            {error && <div className="text-red-500">{error}</div>}
        </div>
    );
}

export function DecisionReportSection() {
    const { isLightMode } = useTheme();
    const [decisions, setDecisions] = useState([]);
    const [error, setError] = useState(null);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [highlightedDecision, setHighlightedDecision] = useState(null);
    const navigate = useNavigate();
    const authHeader = useAuthHeader();

    const handleDecisionClick = async (clickedDecision) => {
        setHighlightedDecision(clickedDecision);
        navigate(`/posts/${clickedDecision.slug}`)
    };

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const response = await getDecisionsApi(authHeader());
                if (response.status === 'success') {
                    setDecisions(response.response.posts);
                    setError(null);
                    setIsPostsLoading(false);
                } else {
                    setError(response.message);
                    setDecisions([]);
                    setIsPostsLoading(false);
                }
            } catch (error) {
                console.error(error);
                setError('An unexpected error occurred.');
                setDecisions([]);
                setIsPostsLoading(false);
            }
        };

        fetchDecisions();
    }, []);

    return (
        <div className="flex flex-col mt-[10px]">
            <div className={`flex flex-col space-y-[16px] mb-[48px] ${isLightMode ? 'text-[#111315]' : 'text-white'}`}>
                {isPostsLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <CgSpinner className="text-[48px] animate-spin" />
                    </div>
                ) : decisions.map((decision) => (
                        <span
                        key={decision.id}
                        className={`text-[16px] leading-[24px] cursor-pointer ${
                            highlightedDecision?.id === decision.id ? 'text-[#0071FF]' : isLightMode ? 'text-[#111315]' : 'text-white'
                        }`}
                        onClick={() => handleDecisionClick(decision)}
                        >
                        {decision.title}
                        </span>
                ))}
            </div>

            {
                (decisions && decisions.length > 0) && (
                    <span className="flex w-fit bg-[#0071FF] rounded-full px-[32px] py-[15px] text-[16px] leading-[18px] font-medium cursor-pointer"
                    onClick={() => {navigate('/decision/pdf')}}>
                        Generate Decision Report
                    </span>
                )
            }

            {error && (
                <div className="text-red-500">{error}</div>
            )}
        </div>
    )
}

export function GraphSection() {
    const { isLightMode } = useTheme();
    const svgRef = useRef(null);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const authHeader = useAuthHeader();
    const navigate = useNavigate();
  
    const fetchDecisions = async () => {
      try {
        const response = await getUserPostsApi(authHeader());
        if (response.status === 'success' && response.response.posts) {
          setData(response.response.posts);
          setError(null);
        } else {
          setError('No valid data received from API');
        }
      } catch (error) {
        console.error(error);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleNodeClick = async (node) => {
        navigate(`/posts/${node.target.__data__.slug}`)
    };
  
    useEffect(() => {
      fetchDecisions();
    }, []);
  
    useEffect(() => {
      if (!data || data.length === 0) {
        return;
      }
  
      const width = 800;
      const height = 700;
  
      const svg = d3.select(svgRef.current);
  
      const flattenData = (data) => {
        const nodes = [];
        const links = [];
  
        const traverse = (node, parent) => {
          nodes.push(node);
          if (parent) {
            links.push({ source: parent, target: node });
          }
          if (node.children) {
            node.children.forEach((child) => traverse(child, node));
          }
        };
  
        data.forEach((rootNode) => traverse(rootNode, null));
  
        return { nodes, links };
      };
  
      const { nodes, links } = flattenData(data);
  
      const simulation = d3
        .forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d) => d.id).distance(300).strength(1))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('x', d3.forceX(width / 2))
        .force('y', d3.forceY(height / 2));
  
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
        .attr('class', 'node')
        .on('click', (d) => handleNodeClick(d));

        nodeGroup
        .append('circle')
        .attr('r', 15)
        .attr('fill', (d) => {
            if (isLightMode) {
            return d.is_decision ? '#BF625F' : '#C7A567';
            } else {
            return d.is_decision ? '#BF625F' : '#C7A567';
            }
        });

        nodeGroup
        .append('text')
        .attr('dy', '-1.5em')
        .attr('text-anchor', 'middle')
        .attr('class', 'node-text') 
        .text((d) => d.title);
  
    function ticked() {
        link
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);
        
        nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
        }
  
      simulation.on('tick', ticked);
  
      return () => {
        simulation.stop();
      };
    }, [data, isLightMode]);
  
    if (isLoading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }
  
    return (
        <div className="graph-bg">
          <svg ref={svgRef} width="100%" height="730" />
        </div>
      );
}

export default function Sidebar() {
    const { isLightMode } = useTheme();
    const [activePage, setActivePage] = useState("dashboard");
    const isAuthenticated = useIsAuthenticated()

    return (
        <aside className="px-[40px] py-[32px] sticky top-0" id="sidebar-content">
            <div className="py-[24px] flex items-center justify-start space-x-[18px] text-[14px] font-normal">

                    <div
                onClick={() => setActivePage('search')}
                className={`cursor-pointer py-[12px] ${isLightMode ? 'text-[#111315]' : 'text-white'} ${activePage == 'search' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                >
                <BsSearch className="text-[18px]" />
                </div>

                <div
                onClick={() => setActivePage('dashboard')}
                className={`cursor-pointer py-[12px] ${isLightMode ? 'text-[#111315]' : 'text-white'} ${activePage == 'dashboard' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                >
                List of Content
                </div>
                {isAuthenticated() && (
                <>
                    <div
                    onClick={() => setActivePage('bookmark')}
                    className={`cursor-pointer py-[12px] ${isLightMode ? 'text-[#111315]' : 'text-white'} ${activePage == 'bookmark' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                    >
                    Your Bookmarks
                    </div>

                    <div
                    onClick={() => setActivePage('decision-graph')}
                    className={`cursor-pointer py-[12px] ${isLightMode ? 'text-[#111315]' : 'text-white'} ${activePage == 'decision-graph' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                    >
                    Your Decision Graph
                    </div>

                    <div
                    onClick={() => setActivePage('decision-report')}
                    className={`cursor-pointer py-[12px] ${isLightMode ? 'text-[#111315]' : 'text-white'} ${activePage == 'decision-report' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                    >
                    Your Decision Report
                    </div>
                </>
                )}
              </div>

            {
                activePage == 'search' ? <SearchSection /> : null
            }

            {
                activePage == 'dashboard' ? <ListOfContentSection /> : null
            }

            {
                activePage == 'bookmark' ? <BookmarkSection /> : null
            }

            {
                activePage == 'decision-report' ? <DecisionReportSection /> : null
            }

            {
                activePage == 'decision-graph' ? <GraphSection /> : null
            }

        </aside>
    )

}