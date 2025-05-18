import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { ToastContainer, toast } from "react-toastify";
import { useAuthHeader } from "react-auth-kit";
import { Link, useNavigate } from "react-router-dom";
import { CgMathPlus } from "react-icons/cg";
import { getUserPostsApi } from "../../api/userPost";
import { deletePostApi, getPostsApi } from "../../api/post";
import { useTheme } from "../../context/ThemeContext";
import { usePermify } from "@permify/react-role";
import { 
  FiChevronRight, 
  FiChevronDown, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSearch,
  FiFilter,
  FiRefreshCw
} from "react-icons/fi";
import clsx from "clsx";

function SinglePostRow({ post, handleDeleteClick, level = 0, expandedState, toggleExpand, lastChild = false }) {
  const { isLightMode } = useTheme();
  const hasChildren = post.children && post.children.length > 0;
  const isExpanded = expandedState[post.id];
  const navigate = useNavigate();
  
  // Format the date
  const formattedDate = new Date(post.updated_at || post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Extract the first 3 tags or less
  const displayTags = post.tags ? post.tags.slice(0, 3) : [];
  const hasMoreTags = post.tags && post.tags.length > 3;

  return (
    <>
      <div 
        className={clsx(
          "flex flex-col border-b border-gray-200 dark:border-gray-700",
          level > 0 && "border-l border-gray-200 dark:border-gray-700 ml-6 pl-0",
          lastChild && level > 0 && "border-b-0"
        )}
      >
        <div className={clsx(
          "relative flex items-center py-4 hover:bg-gray-50 dark:hover:bg-gray-800",
          level > 0 && "ml-4"
        )}>
          {/* Hierarchy line and expand/collapse control */}
          <div className="flex items-center" style={{ width: `${level * 24}px` }}>
            {level > 0 && (
              <div className="absolute left-0 h-1/2 border-b border-l border-gray-200 dark:border-gray-700" style={{ width: '24px', top: 0 }}></div>
            )}
            {hasChildren && (
              <button 
                onClick={() => toggleExpand(post.id)} 
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none z-10"
              >
                {isExpanded ? 
                  <FiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : 
                  <FiChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
              </button>
            )}
            {!hasChildren && level > 0 && (
              <div className="w-6"></div> // Spacer to keep alignment
            )}
          </div>
          
          {/* Post information */}
          <div className="flex flex-1 items-center justify-between px-4 sm:px-6">
            <div className="flex flex-col">
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{post.title}</h3>
                
                {/* Tags */}
                <div className="ml-4 flex">
                  {displayTags.map((tag) => (
                    <span 
                      key={tag.id} 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-1"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {hasMoreTags && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      +{post.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Last updated: {formattedDate}</span>
                {post.children && post.children.length > 0 && (
                  <span className="ml-3">{post.children.length} child post{post.children.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Link 
                to={`/posts/${post.slug}`} 
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                title="View post"
              >
                <FiEye className="h-4 w-4" />
              </Link>
              <Link 
                to={`/admin/posts/update/${post.id}`} 
                className="p-2 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900"
                title="Edit post"
              >
                <FiEdit2 className="h-4 w-4" />
              </Link>
              <button 
                type="button" 
                onClick={() => handleDeleteClick(post.id)}
                className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-900"
                title="Delete post"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="children">
            {post.children.map((child, index) => (
              <SinglePostRow 
                key={child.id} 
                post={child} 
                handleDeleteClick={handleDeleteClick} 
                level={level + 1} 
                expandedState={expandedState}
                toggleExpand={toggleExpand}
                lastChild={index === post.children.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function PostIndexPage() {
  const { isAuthorized, isLoading: authLoading } = usePermify();
  const { isLightMode } = useTheme();
  
  const authHeader = useAuthHeader();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedState, setExpandedState] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const toggleExpand = (postId) => {
    setExpandedState(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  const expandAll = () => {
    const newState = {};
    const expandRecursively = (posts) => {
      posts.forEach(post => {
        newState[post.id] = true;
        if (post.children && post.children.length > 0) {
          expandRecursively(post.children);
        }
      });
    };
    
    expandRecursively(posts);
    setExpandedState(newState);
  };
  
  const collapseAll = () => {
    setExpandedState({});
  };

  const handleDeleteClick = (postId) => {
    setPostIdToDelete(postId);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (postIdToDelete) {
      const response = await deletePostApi(authHeader(), postIdToDelete);
      if (response.status === "success") {
        // Update the posts state by recursively removing the deleted post
        const removePost = (posts) => {
          return posts.filter(post => {
            if (post.id === postIdToDelete) {
              return false;
            }
            
            if (post.children && post.children.length > 0) {
              post.children = removePost(post.children);
            }
            return true;
          });
        };
        
        setPosts(prev => removePost(prev));
        setFilteredPosts(prev => removePost(prev));
        toast.success(response.message);
      } else {
        console.error("Error deleting post:", response);
        toast.error(response.message);
      }
    }
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  // Filter posts by search term
  const filterPosts = (term) => {
    if (!term.trim()) {
      setFilteredPosts(posts);
      return;
    }
    
    const lowerCaseTerm = term.toLowerCase();
    
    // Helper function to filter posts recursively
    const filterRecursively = (posts) => {
      return posts.filter(post => {
        // Check if post title matches the search term
        const titleMatches = post.title.toLowerCase().includes(lowerCaseTerm);
        
        // Check if any tag matches the search term
        const tagMatches = post.tags && post.tags.some(tag => 
          tag.name.toLowerCase().includes(lowerCaseTerm)
        );
        
        // Check if any children match the search term
        let childrenMatch = false;
        let filteredChildren = [];
        
        if (post.children && post.children.length > 0) {
          filteredChildren = filterRecursively(post.children);
          childrenMatch = filteredChildren.length > 0;
        }
        
        // If children match, update the post's children with filtered children
        if (childrenMatch) {
          post.children = filteredChildren;
        }
        
        // Include post if it matches or its children match
        return titleMatches || tagMatches || childrenMatch;
      });
    };
    
    const filtered = filterRecursively(JSON.parse(JSON.stringify(posts)));
    setFilteredPosts(filtered);
  };

  useEffect(() => {
    fetchPostsData();
  }, []);
  
  useEffect(() => {
    filterPosts(searchTerm);
  }, [searchTerm, posts]);

  const fetchPostsData = async () => {
    setIsLoading(true);
    
    if (!await isAuthorized(["admin", "super-admin"], [])) {
      navigate('/');
      return;
    }

    try {
      const response = await getUserPostsApi(authHeader());
      if (response.status === "success") {
        const receivedPosts = response.response.posts;
        
        // Initially expand only the top two levels
        const initialExpandedState = {};
        receivedPosts.forEach(post => {
          initialExpandedState[post.id] = true;
        });
        
        setPosts(receivedPosts);
        setFilteredPosts(receivedPosts);
        setExpandedState(initialExpandedState);
      } else {
        console.error("Error fetching post data:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
      toast.error("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>DSS | Posts</title>
      </Helmet>

      <Header />

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
      
      <div className="h-screen bg-opacity-0 bg-transparent">
        <section className="max-w-7xl mx-auto my-[50px] px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl">
                Posts
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your content hierarchy and organization
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                to="/admin/posts/create"
                className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <CgMathPlus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                New Post
              </Link>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="mt-5 mb-8">
            <div className="sm:flex sm:items-center">
              <div className="relative flex-grow max-w-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-10 pr-3.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700"
                  placeholder="Search by title or tag..."
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setSearchTerm('')}
                  >
                    <span className="text-gray-500 dark:text-gray-400">×</span>
                  </button>
                )}
              </div>
              
              <div className="mt-3 sm:mt-0 sm:ml-4 flex">
                <button
                  type="button"
                  onClick={expandAll}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700"
                >
                  Collapse All
                </button>
                <button
                  type="button"
                  onClick={fetchPostsData}
                  className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700"
                >
                  <FiRefreshCw className={clsx("h-4 w-4 mr-1.5", isLoading && "animate-spin")} />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Search results count */}
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Found {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for "{searchTerm}"
              </div>
            )}
          </div>
          
          {/* Post list */}
          <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-700/5 sm:rounded-lg overflow-hidden mb-8">
            {isLoading ? (
              <div className="py-16 flex justify-center items-center">
                <FiRefreshCw className="animate-spin h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">Loading posts...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No posts found matching your search.' : 'No posts yet. Click "New Post" to create one.'}
                </p>
              </div>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {filteredPosts.map((post, index) => (
                  <SinglePostRow 
                    key={post.id} 
                    post={post} 
                    handleDeleteClick={handleDeleteClick}
                    level={0}
                    expandedState={expandedState}
                    toggleExpand={toggleExpand}
                    lastChild={index === filteredPosts.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* Delete confirmation modal */}
      {showConfirmation && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-200" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      Delete Post
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this post? This action cannot be undone and any child posts will be lost.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}