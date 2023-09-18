import { Disclosure, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { BsSearch, BsChevronUp, BsBookmarkFill } from "react-icons/bs";
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';
import data from './miserables.json';
import { searchAPI } from "../api/search";
import { useAuthHeader } from "react-auth-kit";
import { getPostBySlugApi, getUserPostsApi } from "../api/userPost";
import { getBookmarksApi } from "../api/bookmark";
import { getDecisionsApi } from "../api/decision";
import { useNavigate } from "react-router-dom";
import { set } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";

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
            ) : Object.keys(userPosts).reverse().map((category) => (
                <Disclosure key={category}>
                    {({ open = true }) => (
                        <section className="bg-[#41474D] px-[25px] py-[16px] rounded-[12px]">
                            <Disclosure.Button className="flex w-full justify-between items-center text-left text-[16px] font-medium text-white">
                                <span>{userPosts[category][0].title}</span>
                                <div className="bg-[#0071FF] rounded-full p-[14px]">
                                    <BsChevronUp
                                        className={`${open ? 'rotate-180 transform' : 'rotate-90'
                                            } text-[16px] text-white`}
                                    />
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
                                        {userPosts[category].map((post) => (
                                            <a
                                                key={post.id}
                                                className={`text-[16px] leading-[24px] cursor-pointer ${highlightedPost?.id === post.id ? 'text-[#0071FF]' : 'text-white'
                                                    }`}
                                                onClick={() => handlePostClick(post)}
                                            >
                                                {post.title}
                                            </a>
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
            <div className="flex flex-col space-y-[16px] mb-[48px]">
                {isPostsLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <CgSpinner className="text-white text-[48px] animate-spin" />
                    </div>
                ) : decisions.map((decision) => (
                    <a key={decision.id} className="text-white text-[16px] leading-[24px] flex items-center cursor-pointer">
                        <span>{decision.title}</span>
                    </a>
                ))}
            </div>

            <a className="flex w-fit bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium">
                Generate Decision Report
            </a>

            {error && (
                <div className="text-red-500">{error}</div>
            )}
        </div>
    )
}

export function GraphSection() {
    return (
        <ForceGraph2D
            graphData={data}
            nodeColor='#000000'
            backgroundColor="#ffffff"
            width={document.getElementById('sidebar-content').offsetWidth - 80}
            height={document.getElementById('sidebar-content').parentElement.offsetHeight - 300}
            nodeLabel="id"
            onNodeClick={(node) => {
                window.location.href = '/' + node.slug;
            }}
            nodeThreeObject={node => {
                const nodeEl = document.createElement('a');
                nodeEl.textContent = node.id;
                nodeEl.style.color = '#000000';
                nodeEl.className = 'node-label';
                nodeEl.innerText = node.id;
                return new CSS2DObject(nodeEl);
            }}
            nodeThreeObjectExtend={true}
        />
    );
}


export default function Sidebar() {
    const [activePage, setActivePage] = useState("dashboard");

    return (
        <aside className="px-[40px] py-[32px] min-h-full" id="sidebar-content">
            <div className="py-[24px] flex items-center justify-start space-x-[18px] text-[14px] font-normal">
                <div onClick={() => setActivePage('search')} className={`cursor-pointer text-white py-[12px]  ${activePage == 'search' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    <BsSearch className="text-[18px]" />
                </div>

                <div onClick={() => setActivePage('dashboard')} className={`cursor-pointer text-white py-[12px] ${activePage == 'dashboard' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    List of Content
                </div>

                <div onClick={() => setActivePage('bookmark')} className={`cursor-pointer text-white py-[12px] ${activePage == 'bookmark' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    Your Bookmarks
                </div>

                <div onClick={() => setActivePage('decision-graph')} className={`cursor-pointer text-white py-[12px] ${activePage == 'decision-graph' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    Your Decision Graph
                </div>

                <div onClick={() => setActivePage('decision-report')} className={`cursor-pointer text-white py-[12px] ${activePage == 'decision-report' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    Your Decision Report
                </div>

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