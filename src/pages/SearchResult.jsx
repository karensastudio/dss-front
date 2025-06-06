import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useState, useRef } from "react";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { HiMinus, HiPlus } from "react-icons/hi";
import ForceGraph2D from 'react-force-graph-2d';
import { useAuthHeader } from "react-auth-kit";
import { ChevronRightIcon, EnvelopeIcon, ExclamationTriangleIcon, PhoneIcon } from "@heroicons/react/20/solid";
import { getBookmarksApi } from "../api/bookmark";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { searchAPI } from "../api/search";


export default function SearchResultPage() {
  const [isTagRelationEnabled, setTagRelationEnabled] = useState(false);
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  
  const authHeader = useAuthHeader();
  const location = useLocation();

  // get q parameter with react router
  let [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query');

  // Search helper terms
  const searchHelperTerms = [
    "Project framework",
    "Stakeholder Mapping",
    "Monitoring",
    "Evaluation",
    "MERL",
    "Communications",
    "Raising awareness",
    "Co-creation Team",
    "Engagement",
    "Co-creation",
    "Co-design",
    "Co-implementation",
    "Conflict resolution",
    "Co-governance",
    "Upscaling",
    "Post-project actions"
  ];

  const fetchUserPosts = async (query) => {
    if (!query) return;
    
    try {
      setIsPostsLoading(true);
      const response = await searchAPI(authHeader(), query);
      if (response.status === 'success') {
        setUserPosts(response.response.posts);
        setError(null);
      } else {
        setError(response.message);
        setUserPosts([]);
      }
    } catch (error) {
      console.error(error);
      setError('An unexpected error occurred.');
      setUserPosts([]);
    } finally {
      setIsPostsLoading(false);
    }
  };

  // Effect that runs on mount and whenever the URL search params change
  useEffect(() => {
    if (searchQuery) {
      fetchUserPosts(searchQuery);
    }
  }, [location.search]);

  // Handle search helper term click
  const handleHelperTermClick = (term) => {
    setSearchParams({ query: term });
  };

  return (
    <UserLayout pageTitle={'Search Results'} hideSidebar>
      <div className="w-full flex flex-col min-h-full grow text-black">
        <h1 className="text-lg text-neutral-900 mb-4 flex items-center">
          Search result for: <span className="ml-1 text-2xl font-bold capitalize">{searchQuery}</span>
        </h1>
        
        {/* Search Helper Terms */}
        <div className="mb-6 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex space-x-2 min-w-max">
            {searchHelperTerms.map((term, index) => (
              <button
                key={index}
                onClick={() => handleHelperTermClick(term)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${searchQuery === term 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-blue-200'}`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
        
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
                <p className="text-neutral-900 font-bold">No results found for your search.</p>
              </div>
            )
          }
        </ul>
      </div>
    </UserLayout>
  );
}