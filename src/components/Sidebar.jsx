import { useEffect, useState } from "react";
import { BsSearch, BsChevronLeft } from "react-icons/bs";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import { getPostBySlugApi, getUserPostsApi } from "../api/userPost";
import { useNavigate } from "react-router-dom";
import { CgSpinner } from "react-icons/cg";
import { useRecoilState } from "recoil";
import { SinglePostLoadingState, SinglePostState } from "../states";
import clsx from "clsx";
import { HierarchicalListItem } from "./HierarchicalListItem";
import "./sidebar.css";

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

  return (
    <div className="flex flex-col space-y-[16px]">
      {isPostsLoading ? (
        // Improved skeleton with hierarchy hints
        <ul
          role="list"
          className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-2"
        >
          {[1, 2, 3].map((i) => (
            <li key={i} className="group col-span-1 py-2">
              <div className="flex w-full items-center justify-between space-x-6 p-2">
                <div className="flex items-center space-x-3 w-full">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-6 w-6 bg-gray-100 rounded-full animate-pulse"></div>
              </div>
              
              {/* Skeleton child items */}
              <div className="pl-8 mt-2 space-y-2">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3"></div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-3 overflow-hidden">
          <h3 className="text-lg font-medium text-gray-900 mb-3 px-2">Content Structure</h3>
          <ul
            role="list"
            className="overflow-hidden"
          >
            {userPosts.map((category) => (
              <HierarchicalListItem 
                post={category} 
                PostChanger={PostChanger} 
                key={category.id} 
                depth={0}
              />
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="text-red-500 p-4 rounded-md bg-red-50">{error}</div>
      )}
      
      {singlePostLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <CgSpinner className="animate-spin text-blue-600 text-xl" />
            <span>Loading content...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ tagData, setTagData }) {
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const isAuthenticated = useIsAuthenticated();
  const [isNavOpen, setIsNavOpen] = useState(false);

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
        // On mobile, close the navigation after selection
        if (window.innerWidth < 768) {
          setIsNavOpen(false);
        }
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
    <aside className="sticky top-0 max-h-screen overflow-y-auto bg-white shadow-sm" id="sidebar-content">
      {/* Navigation tabs */}
      <div className="py-3 px-4 flex items-center justify-between border-b">
        <h2 className="text-lg font-semibold text-gray-800">DSS Navigation</h2>
        <button 
          className="md:hidden p-2 rounded-full hover:bg-gray-100"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle navigation"
        >
          {isNavOpen ? "×" : "☰"}
        </button>
      </div>

      {/* Main content - responsive */}
      <div className={`${isNavOpen ? 'block' : 'hidden'} md:block transition-all duration-200`}>
        {tagData ? (
          <div className="mx-4 py-4 space-y-4">
            <div className="flex items-center text-gray-600 text-sm cursor-pointer hover:text-blue-600 transition-colors">
              <BsChevronLeft className="mr-2" />
              <span onClick={handleGoBack}>Go back</span>
            </div>

            <div className="space-y-3 mb-6">
              {tagData?.posts?.map((post) => (
                <div
                  key={post.id}
                  className={clsx(
                    "px-3 py-2 rounded-md cursor-pointer text-sm transition-colors",
                    singlePost?.id === post.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => PostChanger(post.slug)}
                >
                  {post.title}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2">
            {/* Tab navigation if needed */}
            {isAuthenticated() && (
              <div className="flex border-b mb-4 text-sm">
                <button
                  onClick={() => setActivePage('dashboard')}
                  className={clsx(
                    "px-4 py-2 font-medium transition-colors",
                    activePage === 'dashboard' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Content
                </button>
                {/* <button
                  onClick={() => setActivePage('bookmark')}
                  className={clsx(
                    "px-4 py-2 font-medium transition-colors",
                    activePage === 'bookmark' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Bookmarks
                </button>
                <button
                  onClick={() => setActivePage('decision-graph')}
                  className={clsx(
                    "px-4 py-2 font-medium transition-colors",
                    activePage === 'decision-graph' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Decisions
                </button> */}
              </div>
            )}
            
            <ListOfContentSection />
          </div>
        )}
      </div>
    </aside>
  );
}