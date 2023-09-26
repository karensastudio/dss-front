import { useEffect, useState } from "react";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BsBookmark, BsChevronLeft, BsFillChatTextFill, BsPencilSquare, BsShare } from "react-icons/bs";
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



export default function A131Page() {
    const { isLightMode } = useTheme();
    const location = useLocation();
    const [post, setPost] = useState([]);
    const [tag, setTag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentType, setCommentType] = useState('propose');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const navigate = useNavigate()
    const authHeader = useAuthHeader();
    const slug = location.pathname.split("/")[2];
    const isAuthenticated = useIsAuthenticated();
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
    const [isDecisionLoading, setIsDecisionLoading] = useState(false);
    const [tagDataLoading, setTagDataLoading] = useState(false);
    const [tagLoadingState, setTagLoadingState] = useState({});

    const fetchPostData = async () => {
        try {
            const response = await getPostBySlugApi(authHeader(), slug);

            if (response.status === 'success') {
                setPost(response.response.post);
                setIsDecisionLoading(false);
                setIsBookmarkLoading(false);
            } else {
                console.error(response.message);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

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
            if (post.is_bookmark) {
                await detachBookmarkApi(authHeader(), post.id).then(() => { fetchPostData() });
                toast.success("Bookmark removed");
            } else {
                await attachBookmarkApi(authHeader(), post.id).then(() => { fetchPostData() });
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
            if (post.is_decision) {
                await detachDecisionApi(authHeader(), post.id).then(() => { fetchPostData() });
                toast.success("Decision removed");
            } else {
                await attachDecisionApi(authHeader(), post.id).then(() => { fetchPostData() });
                toast.success("Decision added");;
            }
        } catch (error) {
            console.error(error);
            setIsDecisionLoading(false);
        }
    };

    const getPostBreadcrumbByParentTitles = (post) => {
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
        fetchPostData();
    }, [slug]);

    return (
        <UserLayout pageTitle={'Homepage'} tagData={tag} setTagData={setTag}>
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

            <div className={`w-full ${isLightMode ? 'bg-white text-[#111315]' : 'bg-[#111315] text-white'}`}>

                <div className={`mx-[40px] py-[24px] border-b-[1px] flex items-center justify-between ${isLightMode ? 'border-b-[#111315]' : 'border-b-white'}`}>
                    <p className="text-[14px] leading-[20px] text-opacity-60">
                        {getPostBreadcrumbByParentTitles(post).join(' | ')}
                    </p>

                    <div className="flex space-x-[16px] text-[18px] cursor-pointer">

                        <BsFillChatTextFill
                            onClick={() => openChat('note')}
                            data-for="note-tooltip"
                            data-tooltip-id="note-tooltip"
                            data-tooltip-content="Add your note"
                        />
                        <Tooltip id="note-tooltip"/>

                        <BsPencilSquare
                            onClick={() => openChat('propose')}
                            data-for="propose-tooltip"
                            data-tooltip-id="propose-tooltip"
                            data-tooltip-content="Propose to editor"
                        />
                        <Tooltip id="propose-tooltip"/>

                        {
                            isBookmarkLoading ? <div className={`animate-spin rounded-full h-[24px] w-[24px] border-t-[2px] ${isLightMode ? 'border-[#111315]' : 'border-white'}`}></div> : <BsBookmark className={post?.is_bookmark ? "text-[#0071FF]" : ""} onClick={handleBookmarkChange} />
                        }
                        <BsShare />
                    </div>
                </div>
                <div className="mx-[40px] py-[24px] flex items-center justify-between">
                    <div className="flex items-center text-opacity-60 text-[14px] leading-[20px] cursor-pointer">
                        <BsChevronLeft className="mr-[12px]" />
                        <span onClick={() => { navigate(-1) }}>Go back</span>
                    </div>

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
                                    checked={post?.is_decision}
                                    onChange={handleDecisionChange}
                                    className="w-[24px] h-[24px] rounded-[4px] bg-[#2B2F33] ml-[10px] inline-flex"
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">
                    <h1 className="text-[24px] leading-[32px]">{post?.title}</h1>
                </div>

                <div className="mx-[40px] py-[24px]">
                    <div className="flex items-center justify-start space-x-[8px]">
                    {post?.tags?.map((tag) => (
                        <div key={tag.id} className="flex items-center">
                            <span
                                className={`px-[12px] py-[2px] text-[12px] leading-[20px] rounded-full border-[1px] cursor-pointer ${isLightMode ? 'border-[#111315]' : 'border-white'}`}
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
                    <div className={`${isLightMode ? 'light-editor-text' : 'editor-text'}`}>
                        {post?.description && parse(post?.description)}
                    </div>
                </div>
            </div>
            {isChatOpen && <CommentPopUp type={commentType} postId={post.id} onClose={closeChat} />}
        </UserLayout>
    )

}