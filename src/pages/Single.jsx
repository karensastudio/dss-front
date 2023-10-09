import { useEffect, useState } from "react";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BsChevronLeft } from "react-icons/bs";
import { MdMessage, MdContactMail, MdOutlineBookmarkBorder, MdOutlineBookmark, MdOutlineShare } from "react-icons/md";
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

    async function PostChanger(slug) {
        try {
            const response = await getPostBySlugApi(authHeader(), slug);

            if (response.status === 'success') {
                setSinglePost(response.response.post);

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
                toast.success("Decision removed");
            } else {
                await attachDecisionApi(authHeader(), singlePost.id).then(() => { PostChanger(singlePost.slug); });
                setIsDecision(true);
                toast.success("Decision added");;
            }
            setIsDecisionLoading(false);
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
        PostChanger(slug);
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
                        <CgSpinner className="text-white text-[36px] animate-spin" />
                    </div>
                ) : <>
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
                                            <CgSpinner className="text-white text-[20px] animate-spin" />
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
                            <div className={`text-editor text-[14px] text-[#444444] dark:text-neutral-200`}>
                                {singlePost?.description && parse(singlePost?.description)}
                            </div>
                        </div>
                    </div>
                    {isChatOpen && <CommentPopUp type={commentType} postId={singlePost.id} onClose={closeChat} />}
                </>
            }

        </UserLayout>
    )

}