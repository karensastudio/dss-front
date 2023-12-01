import { useEffect, useState } from "react";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FiEdit2 } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { BsChatDots } from "react-icons/bs";
import { GoReport } from "react-icons/go";
import { HiShare, HiBookmark, HiLifebuoy, HiChatBubbleBottomCenterText, HiFolderPlus } from "react-icons/hi2";
import UserLayout from "../layouts/User";
import { attachDecisionApi, detachDecisionApi } from "../api/decision";
import { attachBookmarkApi, detachBookmarkApi } from "../api/bookmark";
import { getPostBySlugApi } from "../api/userPost";
import parse from 'html-react-parser';
import CommentPopUp from "../components/CommentPopUp";
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { useTheme } from "../context/ThemeContext";
import { CgSpinner } from "react-icons/cg";
import { getUserTagByIdApi } from "../api/tag";
import { useRecoilState, useRecoilValue } from "recoil";
import { SinglePostLoadingState, SinglePostState } from "../states";
import { Disclosure, Transition } from "@headlessui/react";
import HeadingComponentV2 from "../components/editor/HeadingComponentV2";
import ImageComponent from "../components/editor/ImageComponent";
import LinkComponent from "../components/editor/LinkComponent";
import { BookmarkSlashIcon, ChevronRightIcon, EnvelopeIcon, HomeIcon, PhoneIcon } from '@heroicons/react/20/solid'
import clsx from "clsx";
import ToggleComponent from "../components/editor/ToggleComponent";
import ParagraphComponent from "../components/editor/ParagraphComponent";
import { BookmarkIcon, FolderMinusIcon, FolderPlusIcon } from "@heroicons/react/24/outline";
import TableComponent from "../components/editor/TableComponent";
import { set } from "react-hook-form";
import { HasAccess } from "@permify/react-role";

function unsecuredCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
}

export default function SinglePostPage() {
    const location = useLocation();
    const [tag, setTag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentType, setCommentType] = useState('propose');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const navigate = useNavigate()
    const authHeader = useAuthHeader();
    const slug = location.pathname.split("/")[2];
    const isAuthenticated = useIsAuthenticated();

    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const [isDecisionLoading, setIsDecisionLoading] = useState(false);
    const [isDecision, setIsDecision] = useState(false);

    const [tagDataLoading, setTagDataLoading] = useState(false);
    const [tagLoadingState, setTagLoadingState] = useState({});

    const [singlePost, setSinglePost] = useRecoilState(SinglePostState);
    const [singlePostLoading, setSinglePostLoading] = useRecoilState(SinglePostLoadingState);
    const [singlePostDataJSON, setSinglePostDataJSON] = useState(null);

    console.log(singlePostDataJSON)

    async function PostChanger(slug) {
        setSinglePost(null);
        setSinglePostLoading(true);
        setSinglePostDataJSON(null);
        try {
            const response = await getPostBySlugApi(authHeader(), slug);

            if (response.status === 'success') {
                setSinglePost(response.response.post);
                let tmpSinglePostDataJSON = JSON.parse(response.response.post.description);

                // set toggle blocks childrens from by item value from next block to children
                tmpSinglePostDataJSON.blocks.map((block) => {
                    if (block.type == "toggle") {
                        const TMPToggleChilds = tmpSinglePostDataJSON?.blocks.slice(tmpSinglePostDataJSON.blocks.indexOf(block) + 1, tmpSinglePostDataJSON.blocks.indexOf(block) + 1 + block.data.items);
                        block.data.children = TMPToggleChilds;

                        // remove childrens from main blocks
                        TMPToggleChilds?.map((subBlock) => {
                            tmpSinglePostDataJSON.blocks.splice(tmpSinglePostDataJSON.blocks.indexOf(subBlock), 1);
                        })
                    }
                })

                setSinglePostDataJSON(tmpSinglePostDataJSON);

                // setSinglePostDataJSON(JSON.parse(response.response.post.description));

                // change url to /posts/:slug
                navigate(`/posts/${slug}`);

                // set bookmark state
                setIsBookmarked(response.response.post.is_bookmark);

                // set decision state
                setIsDecision(response.response.post.is_decision);
            } else {
                console.error(response.message);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setSinglePostLoading(false);
        }
    }

    function sharePost() {
        if (navigator.share) {
            navigator.share({
                title: post?.title,
                text: 'Check out DSS',
                url: window.location.href,
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        }
        else if (window.isSecureContext && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
        } else {
            unsecuredCopyToClipboard(window.location.href);
            toast.success("Link copied to clipboard");
        }
    }

    const fetchTagData = async (tagId) => {
        try {
            setTagLoadingState((prevState) => ({
                ...prevState,
                [tagId]: true,
            }));
            const response = await getUserTagByIdApi(authHeader(), tagId);

            if (response.status === 'success') {
                setTag(response.response.tag);
                setTagDataLoading(false)
            } else {
                console.error(response.message);
                setTagDataLoading(false)
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setTagLoadingState((prevState) => ({
                ...prevState,
                [tagId]: false,
            }));
        }
    };

    const handleBookmarkChange = async () => {
        try {
            setIsBookmarkLoading(true);
            if (singlePost.is_bookmark) {
                await detachBookmarkApi(authHeader(), singlePost.id).then(() => {
                    setSinglePost({ ...singlePost, is_bookmark: false });
                });
                setIsBookmarked(false);
                toast.success("Bookmark removed");
            } else {
                await attachBookmarkApi(authHeader(), singlePost.id).then(() => {
                    setSinglePost({ ...singlePost, is_bookmark: true });
                });
                setIsBookmarked(true);
                toast.success("Bookmark added");
            }
            setIsBookmarkLoading(false);
        } catch (error) {
            console.error(error);
            setIsBookmarkLoading(false);
        }
    };

    const handleDecisionChange = async () => {
        try {
            setIsDecisionLoading(true)
            if (singlePost.is_decision) {
                await detachDecisionApi(authHeader(), singlePost.id).then(() => {
                    setSinglePost({ ...singlePost, is_decision: false });
                });
                setIsDecision(false);
                setIsDecisionLoading(false);
                toast.success("Decision removed");
            } else {
                await attachDecisionApi(authHeader(), singlePost.id).then(() => {
                    setSinglePost({ ...singlePost, is_decision: true });
                });
                setIsDecision(true);
                setIsDecisionLoading(false);
                toast.success("Decision added");;
            }
        } catch (error) {
            console.error(error);
            setIsDecisionLoading(false);
        }
    };

    const getPostBreadcrumbByParentTitles = (post) => {
        if (!post) {
            return [];
        }

        let breadcrumb = [];

        if (post.parent) {
            breadcrumb = getPostBreadcrumbByParentTitles(post.parent);
        }

        breadcrumb.push(post);

        return breadcrumb;

    };

    const openChat = (type) => {
        setIsChatOpen(true);
        setCommentType(type);
    };

    const closeChat = () => {
        setIsChatOpen(false);
    };

    useEffect(() => {
        // fetchPostData();
        if (slug) {
            PostChanger(slug);
        }
        else {
            setSinglePostLoading(false);
            setSinglePost(null);
        }
    }, [slug]);

    return (
        <UserLayout pageTitle={singlePost ? singlePost.title : 'Home Page'} tagData={tag} setTagData={setTag}>
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            {
                singlePostLoading ? (
                    <>
                        {/* skeleton */}
                        <nav className="flex mb-3" aria-label="Breadcrumb">
                            <ol role="list" className="flex space-x-4 rounded-lg w-full bg-white px-6 shadow">
                                <li className="flex">
                                    <div className="flex items-center">
                                        <Link to={'/'} className="text-gray-400 hover:text-gray-500">
                                            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                            <span className="sr-only">Home</span>
                                        </Link>
                                    </div>
                                </li>
                                <li className="flex">
                                    <div className="flex items-center">
                                        <svg
                                            className="h-full w-6 flex-shrink-0 text-gray-200"
                                            viewBox="0 0 24 44"
                                            preserveAspectRatio="none"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                                        </svg>
                                        <button
                                            className="ml-4 text-start py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                        </button>
                                    </div>
                                </li>
                                <li className="flex">
                                    <div className="flex items-center">
                                        <svg
                                            className="h-full w-6 flex-shrink-0 text-gray-200"
                                            viewBox="0 0 24 44"
                                            preserveAspectRatio="none"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                                        </svg>
                                        <button
                                            className="ml-4 text-start py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                        </button>
                                    </div>
                                </li>
                            </ol>
                        </nav>

                        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-5">
                            <div className="px-4 py-5 sm:px-6 flex items-center">
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex flex-col items-start gap-3">
                                        <div className="w-60 h-6 rounded-md bg-gray-200 animate-pulse"></div>
                                        <div className="w-12 h-5 rounded-md bg-gray-100 animate-pulse"></div>
                                    </div>
                                    <div className="flex flex-shrink-0 gap-x-3">
                                        <div className="w-12 h-10 rounded-md bg-gray-200 animate-pulse"></div>
                                        <div className="w-12 h-10 rounded-md bg-gray-200 animate-pulse"></div>
                                        <div className="w-12 h-10 rounded-md bg-gray-200 animate-pulse"></div>
                                        <div className="w-12 h-10 rounded-md bg-gray-200 animate-pulse"></div>
                                        <div className="w-12 h-10 rounded-md bg-gray-200 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-5 sm:p-6 flex flex-col gap-3">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                            </div>
                        </div>
                    </>
                ) :
                    (slug &&
                        <>
                            <nav className="flex mb-3" aria-label="Breadcrumb">
                                <ol role="list" className="flex space-x-4 rounded-lg w-full bg-white px-6 shadow">
                                    <li className="flex">
                                        <div className="flex items-center">
                                            <Link to={'/'} className="text-gray-400 hover:text-gray-500">
                                                <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                                <span className="sr-only">Home</span>
                                            </Link>
                                        </div>
                                    </li>
                                    {getPostBreadcrumbByParentTitles(singlePost).map((page) => (
                                        <li key={page.id} className="flex">
                                            <div className="flex items-center">
                                                <svg
                                                    className="h-full w-6 flex-shrink-0 text-gray-200"
                                                    viewBox="0 0 24 44"
                                                    preserveAspectRatio="none"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                                                </svg>
                                                <button
                                                    onClick={() => PostChanger(page.slug)}
                                                    className="ml-4 text-start py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                                    aria-current={page.id == singlePost.id ? 'page' : undefined}
                                                >
                                                    {page.title.slice(0, 20)}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </nav>

                            <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-5">
                                <div className="px-4 py-5 sm:px-6 flex items-center">
                                    <div className="w-full flex flex-col md:flex-row items-start space-y-3 md:items-center justify-between">
                                        <div className="flex items-center">
                                            <div>
                                                <h3 className="text-2xl mb-1 font-bold leading-6 text-gray-900">{singlePost?.title}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {singlePost?.tags?.map((tag) => (
                                                        <Link to={'/tag/' + tag.id} key={tag.id} className="flex items-center">
                                                            <span
                                                                className={`text-[10px] leading-[20px] mr-3 cursor-pointer`}
                                                                onClick={() => fetchTagData(tag.id)}
                                                            >
                                                                #{tag.name}
                                                            </span>
                                                            {tagLoadingState[tag.id] ? (
                                                                <div className="flex items-center justify-center ml-2">
                                                                    <CgSpinner className="text-white text-[20px] animate-spin" />
                                                                </div>
                                                            ) : null}
                                                        </Link>
                                                    ))}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-shrink-0 gap-x-3">
                                            {
                                                isAuthenticated() && (
                                                    <HasAccess
                                                        roles={["admin", "super-admin"]}
                                                    >
                                                        <Link
                                                            data-tooltip-id="AdminEditPostButton"
                                                            data-tooltip-content="Edit Post"
                                                            data-tooltip-place="top"
                                                            to={`/admin/posts/update/${singlePost?.id}`}
                                                            className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                        >
                                                            <FiEdit2 className="h-5 w-5 text-gray-600" aria-hidden="true" />
                                                        </Link>
                                                        <Tooltip id="AdminEditPostButton" />
                                                    </HasAccess>
                                                )
                                            }

                                            {isAuthenticated() && (
                                                <>
                                                    <button
                                                        type="button"
                                                        data-tooltip-id="AddToDecisionButton"
                                                        data-tooltip-content="Add to Decision"
                                                        data-tooltip-place="top"
                                                        className={clsx("relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset",
                                                            isDecision ? "bg-blue-500 ring-blue-600 text-white hover:bg-blue-600" : "bg-white text-gray-600 ring-gray-300 hover:bg-gray-50"
                                                        )}
                                                        onClick={handleDecisionChange}
                                                    >
                                                        {
                                                            isDecisionLoading ?
                                                                <ImSpinner8 className="animate-spin h-4 w-4" aria-hidden="true" /> :
                                                                (
                                                                    isDecision ?
                                                                        <FolderMinusIcon className="h-5 w-5" /> :
                                                                        <FolderPlusIcon className="h-5 w-5" />
                                                                )
                                                        }
                                                    </button>
                                                    <Tooltip id="AddToDecisionButton" />
                                                </>
                                            )}

                                            {
                                                isAuthenticated() && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            data-tooltip-id="AddNoteButton"
                                                            data-tooltip-content="Add Note"
                                                            data-tooltip-place="top"
                                                            className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                            onClick={() => openChat('note')}
                                                        >
                                                            <BsChatDots className="h-5 w-5 text-gray-600" aria-hidden="true" />
                                                        </button>
                                                        <Tooltip id="AddNoteButton" />
                                                    </>
                                                )
                                            }
                                            {
                                                isAuthenticated() && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            data-tooltip-id="AddProposeButton"
                                                            data-tooltip-content="Propose To Editor"
                                                            data-tooltip-place="top"
                                                            className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                            onClick={() => openChat('propose')}
                                                        >
                                                            <GoReport className="h-5 w-5 text-gray-600" aria-hidden="true" />
                                                        </button>
                                                        <Tooltip id="AddProposeButton" />
                                                    </>
                                                )
                                            }

                                            {
                                                isAuthenticated() && (
                                                    <>
                                                        <button
                                                            data-tooltip-id="setBookmarkButton"
                                                            data-tooltip-content="Bookmark"
                                                            data-tooltip-place="top"
                                                            type="button"
                                                            className={clsx("relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset",
                                                                isBookmarked ? "bg-blue-500 ring-blue-500 text-white hover:bg-blue-600" : "bg-white ring-gray-300 hover:bg-gray-50 text-gray-600"
                                                            )}
                                                            onClick={handleBookmarkChange}
                                                        >
                                                            {
                                                                isBookmarkLoading ?
                                                                    <ImSpinner8 className="animate-spin h-4 w-4" aria-hidden="true" /> :
                                                                    (
                                                                        isBookmarked ?
                                                                            <BookmarkSlashIcon className="h-6 w-6" /> :
                                                                            <BookmarkIcon className="h-6 w-6" />
                                                                    )
                                                            }
                                                        </button>
                                                        <Tooltip id="setBookmarkButton" />
                                                    </>
                                                )
                                            }

                                            <>
                                                <button
                                                    type="button"
                                                    data-tooltip-id="SharePostButton"
                                                    data-tooltip-content="Share Post"
                                                    data-tooltip-place="top"
                                                    onClick={sharePost}
                                                    className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                >
                                                    <HiShare className="h-5 w-5 text-gray-600" aria-hidden="true" />
                                                </button>
                                                <Tooltip id="SharePostButton" />
                                            </>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <div className={`text-editor text-[16px] leading-[24px] text-[#444444] dark:text-neutral-200`}>
                                        {singlePostDataJSON &&
                                            singlePostDataJSON.blocks.map((block) => {
                                                if (block.type == "paragraph")
                                                    return <ParagraphComponent block={block} />;
                                                if (block.type == "header")
                                                    return <div key={block.id} className="mb-3">
                                                        <HeadingComponentV2 element={block} />
                                                    </div>;
                                                if (block.type == "Image")
                                                    return <ImageComponent element={block} />;
                                                if (block.type == "raw")
                                                    return <div key={block.id} className="w-full rounded-[12px] mb-3" dangerouslySetInnerHTML={{ __html: block.data.html }}></div>;
                                                if (block.type == "linkTool") {
                                                    return <LinkComponent block={block} />;
                                                }
                                                if (block.type == "warning")
                                                    return <div key={block.id} className="w-full rounded-[12px] bg-gray-500 bg-opacity-10 text-gray-700 dark:text-white p-4 mb-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <div>
                                                                    <span className="text-[16px] leading-[20px] font-semibold">
                                                                        {parse(block.data.title)}
                                                                    </span>
                                                                    <p className="text-[14px]">
                                                                        {parse(block.data.message)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>;
                                                if (block.type == "list")
                                                    return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                        <ul className="list-decimal list-inside pl-5">
                                                            {block.data.items.map((item) => {
                                                                return <li className="mb-3" key={item}>{parse(item)}</li>
                                                            })}
                                                        </ul>
                                                    </div>;
                                                if (block.type == "table")
                                                    return <TableComponent block={block} />;
                                                if (block.type == "toggle") {
                                                    return <ToggleComponent
                                                        block={block}
                                                    />;
                                                }
                                            })
                                        }
                                    </div>
                                </div>
                            </div>

                            {
                                singlePost?.related && singlePost?.related.length > 0 &&
                                (
                                    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
                                        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900">Related Posts</h3>
                                        </div>

                                        <div className="flex flex-col divide-y">
                                            {
                                                singlePost?.related?.map((post) => (
                                                    <Link
                                                        key={post.id}
                                                        to={`/posts/${post.slug}`}
                                                        className="px-4 py-5 sm:p-6 flex w-full items-center justify-between space-x-6 hover:bg-gray-50 transition-all">
                                                        <div className="flex-1 truncate">
                                                            <div className="flex items-center space-x-3">
                                                                <h3 className="truncate text-base font-semibold text-gray-900">{post.title}</h3>
                                                            </div>
                                                            <div className="flex items-center justify-start gap-1">
                                                                {
                                                                    console.log(post)
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-all">
                                                            <ChevronRightIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                                                        </div>
                                                    </Link>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            }

                            {isChatOpen && <CommentPopUp type={commentType} postId={singlePost.id} onClose={closeChat} />}
                        </>
                    )
            }

        </UserLayout>
    )

}