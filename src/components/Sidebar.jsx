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
import { useRecoilState, useRecoilValue } from "recoil";
import { SinglePostLoadingState, SinglePostState } from "../states";
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import clsx from "clsx";

export function SingleListDiclosure(props) {
    const { post, PostChanger } = props;

    const [singlePost, setSinglePost] = useRecoilState(SinglePostState);

    return (
        <li key={post.id}>
            <Disclosure>
                {({ open }) => {
                    return (
                        <>
                            <Disclosure.Button
                                className="group transition-all w-full text-start relative flex justify-between items-center gap-x-6 px-4 py-5 sm:px-6"
                            >
                                <div className="flex min-w-0 gap-x-4">
                                    <div className="min-w-0 flex-auto">
                                        <p className="text-sm font-semibold leading-6 text-gray-900">
                                            <span className="absolute inset-x-0 -top-px bottom-0" />
                                            {post.title}
                                        </p>
                                        <p className="mt-1 flex text-xs leading-5 text-gray-500">
                                            <span className="relative truncate hover:underline">
                                                {post.children.length + 1} Post
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-x-4">
                                    <div className={clsx("group-hover:bg-gray-100 rounded-full transition-all w-7 h-7 flex justify-center items-center", (open ? 'rotate-90 transform' : ''))}>
                                        <ChevronRightIcon className={"h-5 w-5 flex-none text-gray-400"} aria-hidden="true" />
                                    </div>
                                </div>
                            </Disclosure.Button>
                            <Transition
                                enter="transition duration-100 ease-out"
                                enterFrom="transform opacity-0"
                                enterTo="transform opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform opacity-100"
                                leaveTo="transform opacity-0"
                            >
                                <Disclosure.Panel static className="relative flex justify-between gap-x-6 bg-gray-50 border-y w-full">
                                    <ul
                                        role="list"
                                        className="divide-y overflow-hidden w-full"
                                    >
                                        <li
                                            className="cursor-pointer py-3 px-5 w-full text-start relative flex justify-between gap-x-6 hover:bg-gray-50"
                                            onClick={() => PostChanger(post.slug)}
                                        >
                                            <div className="flex min-w-0 gap-x-4">
                                                <div className="min-w-0 flex-auto">
                                                    <p className="text-sm font-semibold leading-6 text-gray-900">
                                                        <span className="absolute inset-x-0 -top-px bottom-0" />
                                                        Introduction
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-x-4">
                                                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                                            </div>
                                        </li>
                                        {
                                            post.children.length > 0 && post.children.map((subPost) => {
                                                if (subPost.children.length > 0) {
                                                    return <SingleListDiclosure post={subPost} PostChanger={PostChanger} />
                                                }
                                                else {
                                                    return (
                                                        <li
                                                            className="cursor-pointer py-3 px-5 w-full text-start relative flex justify-between gap-x-6 hover:bg-gray-50"
                                                            onClick={() => PostChanger(subPost.slug)}
                                                        >
                                                            <div className="flex min-w-0 gap-x-4">
                                                                <div className="min-w-0 flex-auto">
                                                                    <p
                                                                        className={clsx(
                                                                            "text-sm font-semibold leading-6 text-gray-900",
                                                                            singlePost?.id == subPost.id && 'text-blue-500'
                                                                        )}>
                                                                        {subPost.title}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-x-4">
                                                                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                                                            </div>
                                                        </li>
                                                    )
                                                }
                                            })
                                        }
                                    </ul>
                                </Disclosure.Panel>
                            </Transition>
                        </>
                    )
                }
                }
            </Disclosure>
        </li>
    )
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
        <div className="flex flex-col space-y-[16px]">
            {isPostsLoading ? (
                // skeleton
                <ul
                    role="list"
                    className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
                >
                    {
                        [1, 2, 3, 4, 5].map((i) => (
                            <li className="group cursor-pointer col-span-1 divide-y divide-gray-200 bg-white shadow">
                                <div className="flex w-full items-center justify-between space-x-6 p-6">
                                    <div className="flex-1 truncate">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                        </div>
                                        <div className="mt-1 flex items-center space-x-1">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/4"></div>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-all animate-pulse">
                                    </div>
                                </div>
                            </li>
                        ))
                    }
                </ul>
            ) :
                <ul
                    role="list"
                    className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
                >
                    {userPosts.map((category) => {
                        return <SingleListDiclosure post={category} PostChanger={PostChanger} key={category.id} />
                    }
                    )}
                </ul>
            }

            {error && (
                <div className="text-red-500">{error}</div>
            )}
        </div>
    );
}

export default function Sidebar({ tagData, setTagData }) {
    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("dashboard");
    const isAuthenticated = useIsAuthenticated()

    const [singlePost, setSinglePost] = useRecoilState(SinglePostState);
    const [singlePostLoading, setSinglePostLoading] = useRecoilState(SinglePostLoadingState);
    async function PostChanger(slug) {
        setSinglePostLoading(true);
        try {
            const response = await getPostBySlugApi(authHeader(), slug);

            if (response.status === 'success') {
                setSinglePost(response.response.post);
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

    const handleGoBack = () => {
        setTagData(null);
    };

    return (
        <aside className="sticky top-0" id="sidebar-content">
            {/* <div className="py-[24px] flex items-center justify-start space-x-[18px] text-[14px] font-normal">
                
                {tagData ?
                    <div className="mx-[40px] py-[24px] space-y-4">
                        <div className="flex items-center text-opacity-60 text-[#444444] dark:text-neutral-300 text-[14px] leading-[20px] cursor-pointer py-[24px]">
                            <BsChevronLeft className="mr-[12px]" />
                            <span onClick={handleGoBack}>Go back</span>
                        </div>

                        <div className={`flex flex-col space-y-[16px] mb-[48px] text-[#111315] dark:text-white`}>
                            {tagData?.posts?.map((post) => (
                                <span
                                    key={post.id}
                                    className={`text-[16px] leading-[24px] cursor-pointer ${singlePost?.id === post.id ? 'text-[#0071FF]' : 'text-[#111315] dark:text-white'}`}
                                    onClick={() => PostChanger(post.slug)}
                                >
                                    {post.title}
                                </span>
                            ))}
                        </div>
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
            </div> */}

            <ListOfContentSection />

        </aside>
    )

}