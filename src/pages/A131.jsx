import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useEffect, useState } from "react";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BsBookmark, BsChevronLeft, BsFillChatTextFill, BsShare } from "react-icons/bs";
import UserLayout from "../layouts/User";
import { attachDecisionApi, detachDecisionApi } from "../api/decision";
import { attachBookmarkApi, detachBookmarkApi } from "../api/bookmark";
import { getPostBySlugApi } from "../api/userPost";
import parse from 'html-react-parser';
import CommentPopUp from "../components/CommentPopUp";

export default function A131Page() {
    const location = useLocation();
    const [post, setPost] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const navigate = useNavigate()
    const authHeader = useAuthHeader();
    const slug = location.pathname.split("/")[2];
    const isAuthenticated = useIsAuthenticated();
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

    const fetchPostData = async () => {
        try {
            const response = await getPostBySlugApi(authHeader(), slug);

            if (response.status === 'success') {
                setPost(response.response.post);
            } else {
                console.error(response.message);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleBookmarkChange = async () => {
        try {
            setIsBookmarkLoading(true);
            if (post.is_bookmark) {
                await detachBookmarkApi(authHeader(), post.id).then(() => { fetchPostData() });
                toast.success("Bookmark removed");
                setIsBookmarkLoading(false);
            } else {
                await attachBookmarkApi(authHeader(), post.id).then(() => { fetchPostData() });
                toast.success("Bookmark added");
                setIsBookmarkLoading(false);
            }
        } catch (error) {
            console.error(error);
            setIsBookmarkLoading(false);
        }
    };

    const handleDecisionChange = async () => {
        try {
            if (post.is_decision) {
                await detachDecisionApi(authHeader(), post.id).then(() => { fetchPostData() });
                toast.success("Decision removed");
            } else {
                await attachDecisionApi(authHeader(), post.id).then(() => { fetchPostData() });
                toast.success("Decision added");
            }
        } catch (error) {
            console.error(error);
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

    const openChat = () => {
        setIsChatOpen(true);
      };
    
      const closeChat = () => {
        setIsChatOpen(false);
      };

    useEffect(() => {
        fetchPostData();
    }, [slug]);

    return (
        <UserLayout pageTitle={'Homepage'}>
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

            <div className="w-full">
                <div className="mx-[40px] py-[24px] border-b-[1px] border-b-white flex items-center justify-between">
                    <p className="text-white text-[14px] leading-[20px] text-opacity-60">
                        {getPostBreadcrumbByParentTitles(post).join(' | ')}
                    </p>

                    <div className="flex space-x-[16px] text-white text-[18px] cursor-pointer">
                        <BsFillChatTextFill onClick={openChat} />
                        {
                            isBookmarkLoading ? <div className="animate-spin rounded-full h-[24px] w-[24px] border-t-[2px] border-white"></div> : <BsBookmark className={post?.is_bookmark ? "text-[#0071FF]" : ""} onClick={handleBookmarkChange} />
                        }
                        <BsShare />
                    </div>
                </div>
                <div className="mx-[40px] py-[24px] flex items-center justify-between">
                    <div className="flex items-center text-white text-opacity-60 text-[14px] leading-[20px] cursor-pointer">
                        <BsChevronLeft className="mr-[12px]" />
                        <span onClick={() => { navigate(-1) }}>Go back</span>
                    </div>

                    <div className="flex space-x-[16px] text-white text-[18px] items-center">
                        <label className="text-white text-[16px] cursor-pointer flex items-center">
                            Add to My Decision
                            <input
                                type="checkbox"
                                checked={post?.is_decision}
                                onChange={handleDecisionChange}
                                className="w-[24px] h-[24px] rounded-[4px] bg-[#2B2F33] ml-[10px] inline-flex"
                            />
                        </label>
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">
                    <h1 className="text-white text-[24px] leading-[32px]">{post?.title}</h1>
                </div>

                <div className="mx-[40px] py-[24px]">
                    <div className="flex items-center justify-start space-x-[8px]">
                        {post?.tags?.map((tag) => (
                            <span key={tag.id} className="px-[12px] py-[2px] text-[12px] leading-[20px] text-white rounded-full border-[1px] border-white">#{tag.name}</span>
                        ))}
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">
                    <div className="text-white editor-text">
                        {post?.description && parse(post?.description)}
                    </div>
                </div>

                {
                    isAuthenticated() && (
                        <>
                            <div className="mx-[40px] py-[16px]">

                                <h2 className="text-[18px] text-white leading-[24px] mb-[16px]">Add a note, to go into your report</h2>

                                <textarea name="comment" className="w-full rounded-[12px] px-[25px] py-[16px]" placeholder="Write note ..." cols="30" rows="1"></textarea>
                            </div>

                            <div className="mx-[40px] py-[24px] flex items-center justify-between">
                                <p className="text-white text-[18px] leading-[24px]">Would you like to add a Consideration, Tech Note, Case Study ect. to the system?</p>

                                <div className="bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium min-w-fit">
                                    Propose to editor
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
            {isChatOpen && <CommentPopUp onClose={closeChat} />}
        </UserLayout>
    )

}