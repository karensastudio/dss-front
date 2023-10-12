import { useEffect, useState } from "react";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { MdMessage, MdContactMail, MdOutlineBookmarkBorder, MdOutlineBookmark, MdOutlineShare } from "react-icons/md";
import { PiWarningFill } from "react-icons/pi";
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

    async function PostChanger(slug) {
        try {
            const response = await getPostBySlugApi(authHeader(), slug);

            if (response.status === 'success') {
                setSinglePost(response.response.post);
                console.log(JSON.parse(response.response.post.description))
                setSinglePostDataJSON(JSON.parse(response.response.post.description));

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
                await detachBookmarkApi(authHeader(), singlePost.id).then(() => { PostChanger(singlePost.slug); });
                setIsBookmarked(false);
                toast.success("Bookmark removed");
            } else {
                await attachBookmarkApi(authHeader(), singlePost.id).then(() => { PostChanger(singlePost.slug); });
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
                await detachDecisionApi(authHeader(), singlePost.id).then(() => { PostChanger(singlePost.slug); });
                setIsDecision(false);
                setIsDecisionLoading(false);
                toast.success("Decision removed");
            } else {
                await attachDecisionApi(authHeader(), singlePost.id).then(() => { PostChanger(singlePost.slug); });
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

        breadcrumb.push(post.title);

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
    }, [slug]);

    return (
        <UserLayout pageTitle={singlePost ? singlePost.title : ''} tagData={tag} setTagData={setTag}>
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
                    <div className="flex items-center justify-center h-[calc(100vh-72px)]">
                        <CgSpinner className="text-black dark:text-white text-[36px] animate-spin" />
                    </div>
                ) :
                    (slug &&
                        <>
                            <div className={`w-full bg-white text-[#111315] dark:bg-[#111315] dark:text-white`}>

                                <div className={`mx-[40px] py-[24px] border-b-[1px] flex items-center justify-between space-x-[16px] border-b-[#111315] dark:border-b-white`}>
                                    <p className="text-[14px] leading-[20px] text-opacity-60">
                                        {getPostBreadcrumbByParentTitles(singlePost).join(' | ')}
                                    </p>

                                    <div className="flex space-x-[20px] text-[18px] cursor-pointer items-center">

                                        {
                                            isAuthenticated() && (
                                                <>
                                                    <MdMessage
                                                        className="text-[22px]"
                                                        onClick={() => openChat('note')}
                                                        data-for="note-tooltip"
                                                        data-tooltip-id="note-tooltip"
                                                        data-tooltip-content="Add your note"
                                                    />
                                                    <Tooltip id="note-tooltip" />
                                                </>
                                            )
                                        }

                                        {
                                            isAuthenticated() && (
                                                <>
                                                    <MdContactMail
                                                        className="text-[22px]"
                                                        onClick={() => openChat('propose')}
                                                        data-for="propose-tooltip"
                                                        data-tooltip-id="propose-tooltip"
                                                        data-tooltip-content="Propose to editor"
                                                    />
                                                    <Tooltip id="propose-tooltip" />
                                                </>
                                            )
                                        }

                                        {
                                            isAuthenticated() && (
                                                isBookmarkLoading ? <div className={`animate-spin rounded-full h-[24px] w-[24px] border-t-[2px] border-[#111315] dark:border-white`}></div> :
                                                    (
                                                        isBookmarked ?
                                                            <MdOutlineBookmark className="text-[22px]" onClick={handleBookmarkChange} /> :
                                                            <MdOutlineBookmarkBorder className="text-[22px]" onClick={handleBookmarkChange} />
                                                    )
                                            )
                                        }


                                        <MdOutlineShare className="text-[22px]" onClick={sharePost} />
                                    </div>
                                </div>
                                <div className="mx-[40px] py-[24px] flex items-center justify-between">
                                    <div className="flex items-center text-opacity-60 text-[14px] leading-[20px] cursor-pointer">
                                        <BsChevronLeft className="mr-[12px]" />
                                        <span onClick={() => { navigate(-1) }}>Go back</span>
                                    </div>

                                    {isAuthenticated() && (
                                        <div className="flex space-x-[16px] text-[18px] items-center">
                                            {isDecisionLoading ? (
                                                <div className={`flex items-center justify-center`}>
                                                    <CgSpinner className="text-black dark:text-white text-[20px] animate-spin" />
                                                </div>
                                            ) : (
                                                <label className="text-[16px] cursor-pointer flex items-center">
                                                    Add to My Decision
                                                    <input
                                                        type="checkbox"
                                                        checked={isDecision}
                                                        onChange={handleDecisionChange}
                                                        className="w-[24px] h-[24px] rounded-[4px] bg-[#2B2F33] ml-[10px] inline-flex"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mx-[40px] py-[16px]">
                                    <h1 className="text-[24px] leading-[32px]">{singlePost?.title}</h1>
                                </div>

                                <div className="mx-[40px] py-[24px]">
                                    <div className="flex items-center justify-start space-x-[8px]">
                                        {singlePost?.tags?.map((tag) => (
                                            <div key={tag.id} className="flex items-center">
                                                <span
                                                    className={`px-[12px] py-[2px] text-[12px] leading-[20px] rounded-full border-[1px] cursor-pointer border-[#111315] dark:border-white`}
                                                    onClick={() => fetchTagData(tag.id)}
                                                >
                                                    #{tag.name}
                                                </span>
                                                {tagLoadingState[tag.id] ? (
                                                    <div className="flex items-center justify-center ml-2">
                                                        <CgSpinner className="text-white text-[20px] animate-spin" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mx-[40px] py-[16px]">
                                    <div className={`text-editor text-[16px] leading-[24px] text-[#444444] dark:text-neutral-200`}>
                                        {singlePostDataJSON &&
                                            singlePostDataJSON.blocks.map((block) => {
                                                if (block.type == "paragraph")
                                                    // dont show if previous block is toggle
                                                    if (singlePostDataJSON?.blocks[singlePostDataJSON.blocks.indexOf(block) - 1]?.type == "toggle")
                                                        return null;
                                                    else
                                                        return <div key={block.id}><p className="mb-3">{parse(block.data.text)}</p></div>;
                                                if (block.type == "Image")
                                                    return <div key={block.id}><img src={block.data.file.url} alt={block.data.caption} className="w-full rounded-[12px] mb-3" /></div>;
                                                if (block.type == "raw")
                                                    return <div key={block.id} className="w-full rounded-[12px] mb-3" dangerouslySetInnerHTML={{ __html: block.data.html }}></div>;
                                                if (block.type == "linkTool") {
                                                    if (block.data.meta.type == "internal")
                                                        console.log(block.data.meta.title)
                                                    return <Link key={block.id} to={`/posts/${block.data.meta.title}`} className="block cursor-pinter w-full rounded-[12px] px-3 py-5 bg-blue-500 text-white mb-3">
                                                        <div className="text-white ">
                                                            {block.data.meta.title}
                                                        </div>
                                                    </Link>;
                                                }
                                                if (block.type == "warning")
                                                    return <div key={block.id} className="w-full rounded-[12px] bg-gray-500 bg-opacity-10 text-gray-700 dark:text-white p-4 mb-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <div>
                                                                    <span className="text-[16px] leading-[20px] font-semibold">
                                                                        {block.data.title}
                                                                    </span>
                                                                    <p className="text-[14px]">
                                                                        {block.data.message}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>;
                                                if (block.type == "toggle")
                                                    return <Disclosure>
                                                        {({ open }) => (
                                                            /* Use the `open` state to conditionally change the direction of an icon. */
                                                            <div className="border border-white border-opacity-25 rounded-[12px] mb-3">
                                                                <Disclosure.Button className="flex items-center justify-between text-black dark:text-white bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 text-start px-3 py-5 rounded-[12px] w-full">
                                                                    {block.data.text}

                                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white dark:text-gray-200">
                                                                        <BsChevronRight className={`text-[16px] ${open ? 'rotate-90' : 'rotate-0'}`} />
                                                                    </div>
                                                                </Disclosure.Button>
                                                                <Transition
                                                                    enter="transition duration-100 ease-out"
                                                                    enterFrom="transform scale-95 opacity-0"
                                                                    enterTo="transform scale-100 opacity-100"
                                                                    leave="transition duration-75 ease-out"
                                                                    leaveFrom="transform scale-100 opacity-100"
                                                                    leaveTo="transform scale-95 opacity-0"
                                                                >
                                                                    <Disclosure.Panel className="text-black dark:text-white text-opacity-70 px-3 py-5">
                                                                        {/* parse next blocks by block.data.items count as child of this block */}

                                                                        {singlePostDataJSON?.blocks.slice(singlePostDataJSON.blocks.indexOf(block) + 1, singlePostDataJSON.blocks.indexOf(block) + 1 + block.data.items).map((block) => {
                                                                            if (block.type == "paragraph")
                                                                                return <div key={block.id}><p className="mb-3">{parse(block.data.text)}</p></div>;
                                                                            if (block.type == "Image")
                                                                                return <div key={block.id}><img src={block.data.file.url} alt={block.data.caption} className="w-full rounded-[12px] mb-3" /></div>;
                                                                            if (block.type == "raw")
                                                                                return <div key={block.id} className="w-full rounded-[12px] mb-3" dangerouslySetInnerHTML={{ __html: block.data.html }}></div>;
                                                                            if (block.type == "list")
                                                                                return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                                                    <ul className="list-disc list-inside">
                                                                                        {block.data.items.map((item) => {
                                                                                            return <li key={item}>{item}</li>
                                                                                        })}
                                                                                    </ul>
                                                                                </div>;
                                                                            if (block.type == "warning")
                                                                                return <div key={block.id} className="w-full rounded-[12px] bg-orange-500 bg-opacity-10 text-orange-500 p-4 mb-3">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div className="flex items-center space-x-2">
                                                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white dark:text-orange-200">
                                                                                                <PiWarningFill className="text-[16px]" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-[16px] leading-[20px] font-semibold">
                                                                                                    {block.data.title}
                                                                                                </span>
                                                                                                <p className="text-[14px]">
                                                                                                    {block.data.message}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>;
                                                                            if (block.type == "linkTool")
                                                                                return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                                                    <a href={block.data.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{block.data.link}</a>
                                                                                </div>;
                                                                            if (block.type == "list")
                                                                                return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                                                    <ul className="list-disc list-inside">
                                                                                        {block.data.items.map((item) => {
                                                                                            return <li key={item}>{item}</li>
                                                                                        })}
                                                                                    </ul>
                                                                                </div>;
                                                                            if (block.type == "quote")
                                                                                return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                                                    <blockquote className="text-[14px] text-opacity-60">
                                                                                        {block.data.text}
                                                                                    </blockquote>
                                                                                </div>;
                                                                            if (block.type == "table")
                                                                                return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                                                    <table className="w-full">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                {block.data.content[0].map((item) => {
                                                                                                    return <th key={item}>{item}</th>
                                                                                                })}
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {block.data.content.slice(1).map((row) => {
                                                                                                return <tr key={row[0]}>
                                                                                                    {row.map((item) => {
                                                                                                        return <td key={item}>{item}</td>
                                                                                                    })}
                                                                                                </tr>
                                                                                            })}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>;
                                                                            if (block.type == "code")
                                                                                return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                                                    <pre className="bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded-[12px] p-4">
                                                                                        <code className="text-[14px] text-opacity-60">
                                                                                            {block.data.code}
                                                                                        </code>
                                                                                    </pre>
                                                                                </div>;
                                                                        })}
                                                                    </Disclosure.Panel>
                                                                </Transition>
                                                            </div>
                                                        )}
                                                    </Disclosure>
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                            {isChatOpen && <CommentPopUp type={commentType} postId={singlePost.id} onClose={closeChat} />}
                        </>
                    )
            }

        </UserLayout>
    )

}