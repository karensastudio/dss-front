import { Disclosure, Transition } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { BsSearch, BsChevronUp, BsBookmarkFill, BsChevronLeft } from "react-icons/bs";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { getPostBySlugApi, getUserGraphApi, getUserPostsApi } from "../api/userPost";
import { getDecisionsApi } from "../api/decision";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { CgSpinner } from "react-icons/cg";
import * as d3 from 'd3';
import { getBookmarksApi } from "../api/bookmark";
import { searchAPI } from "../api/search";
import { useRecoilState } from "recoil";
import { SinglePostLoadingState, SinglePostState } from "../states";

export function SearchSection() {
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
        if (e.key == 'Enter') {
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
    const [userPosts, setUserPosts] = useState([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [error, setError] = useState(null);
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

    const [singlePost, setSinglePost] = useRecoilState(SinglePostState);
    const [singlePostLoading, setSinglePostLoading] = useRecoilState(SinglePostLoadingState);
    async function PostChanger(slug) {
        setSinglePostLoading(true);
        try {
            const response = await getPostBySlugApi(authHeader(), slug);
            
            if (response.status === 'success') {
                setSinglePost(response.response.post);
                
                // change url to /posts/:slug
                navigate(`/posts/${slug}`);
                setSinglePostLoading(false);
            } else {
                console.error(response.message);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setSinglePostLoading(false);
        }
    }

    function isCategoryOrChildrensActive(category) {
        if (singlePost?.id === category.id) {
            return true;
        }

        if (category.children.length > 0) {
            return category.children.some((post) => post.id === singlePost?.id);
        }

        return false;
    }

    return (
        <div className="flex flex-col space-y-[16px] mt-[10px]">
            {isPostsLoading ? (
                <div className="flex items-center justify-center py-10">
                    <CgSpinner className="text-white text-[48px] animate-spin" />
                </div>
            ) : userPosts.map((category) => (
                <Disclosure key={category.id}>
                    {({ open = true }) => (
                        <section className={`px-[25px] py-[16px] rounded-[12px] bg-white text-[#111315] dark:bg-[#41474D] dark:text-white`}>
                            <Disclosure.Button className="flex w-full justify-between items-center text-left text-[16px] font-medium">
                                <span>{category.title}</span>
                                <div className="bg-[#0071FF] rounded-full p-[14px]">
                                    <BsChevronUp className={`${open ? 'rotate-180 transform' : 'rotate-90'} text-[16px] text-white`} />
                                </div>
                            </Disclosure.Button>
                            <Transition
                                show={(open || isCategoryOrChildrensActive(category)  )}
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
                                            className={`text-[16px] leading-[24px] cursor-pointer ${singlePost?.id === category.id ? 'text-[#0071FF]' : 'text-[#111315] dark:text-white'
                                                }`}
                                            onClick={() => PostChanger(category.slug)}
                                        >
                                            Introduction
                                        </span>
                                        {category.children.map((post) => (
                                            <span
                                                key={post.id}
                                                className={`text-[16px] leading-[24px] cursor-pointer ${singlePost?.id === post.id ? 'text-[#0071FF]' : 'text-[#111315] dark:text-white'
                                                    }`}
                                                onClick={() => PostChanger(post.slug)}
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
                    className={`text-[16px] leading-[24px] cursor-pointer flex items-center ${highlightedBookmark?.id === bookmark.id
                        ? 'text-[#0071FF]'
                        : 'text-[#111315] dark:text-white'
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
            <div className={`flex flex-col space-y-[16px] mb-[48px] text-[#111315] dark:text-white`}>
                {isPostsLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <CgSpinner className="text-[48px] animate-spin" />
                    </div>
                ) : decisions.map((decision) => (
                    <span
                        key={decision.id}
                        className={`text-[16px] leading-[24px] cursor-pointer ${highlightedDecision?.id === decision.id ? 'text-[#0071FF]' : 'text-[#111315] dark:text-white'}`}
                        onClick={() => handleDecisionClick(decision)}
                    >
                        {decision.title}
                    </span>
                ))}
            </div>

            {
                (decisions && decisions.length > 0) && (
                    <span className="flex w-fit bg-[#0071FF] rounded-full px-[32px] py-[15px] text-[16px] leading-[18px] font-medium cursor-pointer"
                        onClick={() => { navigate('/decision/pdf') }}>
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
            const response = await getUserGraphApi(authHeader());
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

            const nodePather = (node) => {
                if (node.children.length == 0)
                    nodes.push(node);
            };

            const linksPather = (node) => {
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
            };

            data.forEach((rootNode) => nodePather(rootNode));
            data.forEach((rootNode) => linksPather(rootNode));

            console.log(links);

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
            .attr('stroke', (isLightMode ? 'black' : 'white'))
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
            .attr('r', 10)
            .attr('fill', (d) => {
                if (isLightMode) {
                    return d.is_decision ? '#4070FB' : '#9ca3af';
                } else {
                    return d.is_decision ? '#4070FB' : '#9ca3af';
                }
            });

        nodeGroup
            .append('text')
            .attr('dy', '-2em')
            .attr('text-anchor', 'middle')
            .attr('fill', (isLightMode ? 'black' : 'white'))
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
        <div className="rounded-[12px] bg-white dark:bg-transparent">
            <svg ref={svgRef} width="100%" height="730" />
        </div>
    );
}

export default function Sidebar({ tagData, setTagData }) {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("dashboard");
    const isAuthenticated = useIsAuthenticated()

    const handleGoBack = () => {
        setTagData(null);
    };

    return (
        <aside className="px-[40px] py-[32px] sticky top-0" id="sidebar-content">
            <div className="py-[24px] flex items-center justify-start space-x-[18px] text-[14px] font-normal">
                {tagData ?
                    <div className="mx-[40px] py-[24px] space-y-4">
                        <div className="flex items-center text-opacity-60 text-[#444444] dark:text-neutral-300 text-[14px] leading-[20px] cursor-pointer py-[24px]">
                            <BsChevronLeft className="mr-[12px]" />
                            <span onClick={handleGoBack}>Go back</span>
                        </div>
                        <span className={`title-text text-[18px] font-[600] text-[#111315] dark:text-white`}>
                            {tagData?.posts?.map((post) => (
                                <div key={post.id}>
                                    <h1 className="text-[24px] leading-[32px] py-[10px]">{post.title}</h1>
                                </div>
                            ))}
                        </span>
                    </div>
                    :
                    <>
                        <div
                            onClick={() => setActivePage('search')}
                            className={`cursor-pointer py-[12px] text-[#111315] dark:text-white ${activePage == 'search' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                        >
                            <BsSearch className="text-[18px]" />
                        </div>

                        <div
                            onClick={() => setActivePage('dashboard')}
                            className={`cursor-pointer py-[12px] text-[#111315] dark:text-white ${activePage == 'dashboard' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                        >
                            List of Content
                        </div>
                        {isAuthenticated() && (
                            <>
                                <div
                                    onClick={() => setActivePage('bookmark')}
                                    className={`cursor-pointer py-[12px] text-[#111315] dark:text-white ${activePage == 'bookmark' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                                >
                                    Your Bookmarks
                                </div>

                                <div
                                    onClick={() => setActivePage('decision-graph')}
                                    className={`cursor-pointer py-[12px] text-[#111315] dark:text-white ${activePage == 'decision-graph' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                                >
                                    Your Decision Graph
                                </div>

                                <div
                                    onClick={() => setActivePage('decision-report')}
                                    className={`cursor-pointer py-[12px] text-[#111315] dark:text-white ${activePage == 'decision-report' ? 'border-b-2 border-b-white' : 'text-opacity-60'}`}
                                >
                                    Your Decision Report
                                </div>
                            </>
                        )}
                    </>}
            </div>

            {
                activePage == 'search' && !tagData ? <SearchSection /> : null
            }

            {
                activePage == 'dashboard' && !tagData ? <ListOfContentSection /> : null
            }

            {
                activePage == 'bookmark' && !tagData ? <BookmarkSection /> : null
            }

            {
                activePage == 'decision-report' && !tagData ? <DecisionReportSection /> : null
            }

            {
                activePage == 'decision-graph' && !tagData ? <GraphSection /> : null
            }

        </aside>
    )

}