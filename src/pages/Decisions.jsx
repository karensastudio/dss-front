import { Switch } from "@headlessui/react";
import UserLayout from "../layouts/User";
import { useEffect, useState } from "react";
import { BsTrash3, BsZoomIn, BsZoomOut } from "react-icons/bs";
import { HiMinus, HiPlus } from "react-icons/hi";
import ForceGraph2D from 'react-force-graph-2d';
import { useAuthHeader } from "react-auth-kit";
import { ChevronRightIcon, EnvelopeIcon, ExclamationTriangleIcon, PhoneIcon } from "@heroicons/react/20/solid";
import { getBookmarksApi } from "../api/bookmark";
import { Link } from "react-router-dom";
import { deleteAllDecisionApi, getDecisionsApi } from "../api/decision";
import clsx from "clsx";
import DecisionTabView, { DecisionTab } from "../components/decisions/DecisionTabView";
import SectionDecisionCard from "../components/decisions/SectionDecisionCard";
import { sectionDecisionStorage } from "../utils/sectionDecisionStorage";


export default function DecisionsPage() {
  const [isTagRelationEnabled, setTagRelationEnabled] = useState(false);
  const [isDecisionRelationEnabled, setDecisionRelationEnabled] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);

  const [isDecisionDeleting, setIsDecisionDeleting] = useState(false);
  const [sectionDecisions, setSectionDecisions] = useState([]);

  const authHeader = useAuthHeader();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getDecisionsApi(authHeader());
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
    
    // Load section decisions from localStorage
    const { sections } = sectionDecisionStorage.getAll();
    setSectionDecisions(sections);
  }, []);

  const handleDecisionDeleteAll = async () => {
    try {
      setIsDecisionDeleting(true)
      await deleteAllDecisionApi(authHeader()).then(() => {
        setUserPosts([]);
        setIsDecisionDeleting(false);
      });

    } catch (error) {
      console.error(error);
      setIsDecisionDeleting(false);
    }
  };
  
  const handleClearSectionDecisions = () => {
    try {
      const result = sectionDecisionStorage.clear();
      if (result.status === 'success') {
        setSectionDecisions([]);
      }
    } catch (error) {
      console.error('Error clearing section decisions:', error);
    }
  };
  
  const handleRemoveSectionDecision = (id) => {
    setSectionDecisions(prev => prev.filter(section => section.id !== id));
  };


  return (
    <UserLayout pageTitle={'Decisions'} hideSidebar>
      <div className="w-full flex flex-col min-h-full grow text-black">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-black font-bold text-2xl">Decisions</h1>

          <div className="flex space-x-2">
            {userPosts.length > 0 && (
              <button
                type="button"
                className={"relative inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-blue-600 shadow-sm hover:bg-blue-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"}
                onClick={handleDecisionDeleteAll}
              >
                <BsTrash3 className="h-4 w-4" />
                {isDecisionDeleting ? (
                  <span className="animate-pulse">Resetting Posts...</span>
                ) : (
                  <span>Clear Posts</span>
                )}
              </button>
            )}
            
            {sectionDecisions.length > 0 && (
              <button
                type="button"
                className={"relative inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-blue-600 shadow-sm hover:bg-blue-100 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"}
                onClick={handleClearSectionDecisions}
              >
                <BsTrash3 className="h-4 w-4" />
                <span>Clear Sections</span>
              </button>
            )}
          </div>
        </div>
        
        <DecisionTabView defaultTab="fullPosts">
          <DecisionTab name="fullPosts" label="Full Posts">
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isPostsLoading ? (
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
                            {console.log(post)}
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
                  <p className="text-neutral-900 font-bold">You have no posts in your decisions.</p>
                </div>
              )}
            </ul>
          </DecisionTab>
          
          <DecisionTab name="sections" label="Sections">
            {sectionDecisions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sectionDecisions.map((section) => (
                  <SectionDecisionCard 
                    key={section.id} 
                    section={section} 
                    onRemove={handleRemoveSectionDecision}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center bg-white py-10 shadow rounded-lg border-x-4 border-x-red-400">
                <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mb-3" aria-hidden="true" />
                <p className="text-neutral-900 font-bold">You have no sections in your decisions.</p>
              </div>
            )}
          </DecisionTab>
        </DecisionTabView>
      </div>
    </UserLayout>
  );
}