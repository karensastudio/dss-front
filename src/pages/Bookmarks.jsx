import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useState } from "react";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { HiMinus, HiPlus } from "react-icons/hi";
import { ForceGraph2D } from 'react-force-graph';
import { useAuthHeader } from "react-auth-kit";
import { ChevronRightIcon, EnvelopeIcon, ExclamationTriangleIcon, PhoneIcon } from "@heroicons/react/20/solid";
import { getBookmarksApi } from "../api/bookmark";
import { Link } from "react-router-dom";


export default function BookmarksPage() {
  const [isTagRelationEnabled, setTagRelationEnabled] = useState(false);
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);

  const authHeader = useAuthHeader();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getBookmarksApi(authHeader());
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

  return (
    <UserLayout pageTitle={'Bookmarks'} hideSidebar>
      <div className="w-full flex flex-col min-h-full grow text-black">
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {
            isPostsLoading ? (
              // skeleton
              <>
                <li className="group cursor-pointer col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                  <div className="flex w-full items-center justify-between space-x-6 p-6">
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="mt-1 flex items-center space-x-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-all animate-pulse">
                    </div>
                  </div>
                </li>
                <li className="group cursor-pointer col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                  <div className="flex w-full items-center justify-between space-x-6 p-6">
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="mt-1 flex items-center space-x-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-all animate-pulse">
                    </div>
                  </div>
                </li>
                <li className="group cursor-pointer col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                  <div className="flex w-full items-center justify-between space-x-6 p-6">
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="mt-1 flex items-center space-x-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-all animate-pulse">
                    </div>
                  </div>
                </li>
              </>
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <li key={post.id} className="group cursor-pointer col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                  <Link
                    to={`/posts/${post.slug}`}
                    className="block w-full h-full"
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
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
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <div className="col-span-3 flex flex-col justify-center items-center bg-white py-10 shadow rounded-lg border-x-4 border-x-red-400">
                <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mb-3" aria-hidden="true" />
                <p className="text-neutral-900 font-bold">You have no bookmarks.</p>
              </div>
            )
          }
        </ul>
      </div>
    </UserLayout>
  );
}