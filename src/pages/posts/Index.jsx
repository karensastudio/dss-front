import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { ToastContainer, toast } from "react-toastify";
import { useAuthHeader } from "react-auth-kit";
import { Link } from "react-router-dom";
import { CgMathPlus } from "react-icons/cg";
import { getUserPostsApi } from "../../api/userPost";
import { deletePostApi, getPostsApi } from "../../api/post";
import { useTheme } from "../../context/ThemeContext";

export default function PostIndexPage() {
  const authHeader = useAuthHeader();
  const [posts, setPosts] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);

  const handleDeleteClick = (postId) => {
    setPostIdToDelete(postId);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (postIdToDelete) {
      const response = await deletePostApi(authHeader(), postIdToDelete);
      if (response.status === "success") {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postIdToDelete));
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

  useEffect(() => {
    fetchPostsData();
  }, []);


  const fetchPostsData = async () => {
    try {
      const response = await getPostsApi(authHeader());
      if (response.status === "success") {
        setPosts(response.response.posts);
      } else {
        console.error("Error fetching post data:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
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

        <section className="max-w-7xl mx-auto my-[50px]">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-lg font-semibold leading-6 text-neutral-900">Posts</h1>
                <p className="mt-2 text-sm text-gray-700">
                  A list of all posts for edit and delete.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to={`/posts/create`}
                  className="flex items-center rounded-full bg-blue-600 px-5 py-2 text-center text-base font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <CgMathPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />

                  Add Post
                </Link>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 mb-10 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Title
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {posts.map((post) => (
                          <tr key={post.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {post.title}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex items-center justify-end gap-5">
                              <Link to={`/posts/update/${post.id}`}
                                className="rounded-full bg-yellow-50 px-5 py-1 text-sm font-medium text-yellow-600 shadow-sm hover:bg-yellow-100"
                              >
                                Edit <span className="sr-only">, {post.slug}</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(post.id)}
                                className="rounded-full bg-red-50 px-4 py-1 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
                              >
                                Delete <span className="sr-only">, {post.slug}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {showConfirmation && (
                      <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                          <div className="fixed inset-0 transition-opacity">
                            <div className={`absolute inset-0 opacity-75 bg-gray-900 dark:bg-gray-900`}></div>
                          </div>
                          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                          <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 bg-gray-100 dark:bg-gray-900`}>
                              <h3 className="text-lg leading-6 font-medium">Confirm Deletion</h3>
                              <div className="mt-2">
                                <p className="text-sm text-gray-400">Are you sure you want to delete this item?</p>
                              </div>
                            </div>
                            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-200 dark:bg-gray-800`}>
                              <button
                                onClick={handleConfirmDelete}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                              >
                                Delete
                              </button>
                              <button
                                onClick={handleCancelDelete}
                                className={`mt-3 w-full inline-flex justify-center rounded-md px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:w-auto sm:text-sm`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
