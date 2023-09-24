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

    return (
        <div className="flex flex-col space-y-[16px]">

            <div className="flex py-[32px] items-center justify-between space-x-[16px]">
                <input
                    type="search"
                    placeholder="Search for content"
                    className="w-full bg-transparent rounded-none focus-within:outline-none text-white py-[15px] text-[20px] border-b-2 border-b-white border-opacity-25 focus:border-opacity-100 leading-[32px] font-medium"
                    onChange={(e) => setSearchValue(e.target.value)}
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
    const [selectedBookmark, setSelectedBookmark] = useState(null);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
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
        setSelectedBookmark(bookmark);
        const bookmarksWithHighlight = bookmarks.map((b) => {
            return {
                ...b,
                highlight: b.id === bookmark.id
            };
        });
        setBookmarks(bookmarksWithHighlight);
        navigate(`/posts/${bookmark.slug}`);

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
                    className={`text-[16px] leading-[24px] flex items-center py-[10px] cursor-pointer ${bookmark.highlight ? 'text-[#0071FF]' : 'text-white'
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
    const authHeader = useAuthHeader();

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
                    <span key={decision.id} className="text-[16px] leading-[24px] flex items-center cursor-pointer">
                        <span>{decision.title}</span>
                    </span>
                ))}
            </div>

            {
                (decisions && decisions.length > 0) && (
                    <span className="flex w-fit bg-[#0071FF] rounded-full px-[32px] py-[15px] text-[16px] leading-[18px] font-medium">
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
const svgRef = useRef(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const authHeader = useAuthHeader();
  
  const fetchUserPosts = async () => {
    try {
      const response = await getUserPostsApi(authHeader());
      if (response.status === 'success') {
        setData(response.response);
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error(error);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserPosts();
  }, []);
  
  useEffect(() => {
    if (!data) {
      return;
    }
  
    const width = 800;
    const height = 400;
  
    const svg = d3.select(svgRef.current);
  
    const simulation = d3
      .forceSimulation(data?.posts || [])
      .force('link', d3.forceLink().id((d) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));
  
    const link = svg
      .selectAll('line')
      .data(data?.posts || [])
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);
  
    const node = svg
      .selectAll('circle')
      .data(data?.posts || [])
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('fill', 'blue');
  
    function ticked() {
      link
        .attr('x1', (d) => d?.source?.x || 0)
        .attr('y1', (d) => d?.source?.y || 0)
        .attr('x2', (d) => d?.target?.x || 0)
        .attr('y2', (d) => d?.target?.y || 0);
  
      node.attr('cx', (d) => d?.x || 0).attr('cy', (d) => d?.y || 0);
    }
  
    simulation.on('tick', ticked);
  
    return () => {
      simulation.stop();
    };
  }, [data]);
  
  if (isLoading) {
    return <p>Loading...</p>;
  }
  
  if (error) {
    return <p>Error: {error}</p>;
  }
  
  return <svg ref={svgRef} width="100%" height="730" />;
}


export default function Sidebar() {
    const { isLightMode } = useTheme();
    const [activePage, setActivePage] = useState("dashboard");
    const isAuthenticated = useIsAuthenticated()

    return (
        <aside className="px-[40px] py-[32px] min-h-full" id="sidebar-content">
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