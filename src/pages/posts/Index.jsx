import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { ToastContainer, toast } from "react-toastify";
import { useAuthHeader } from "react-auth-kit";
import { Link } from "react-router-dom";
import { CgMathPlus } from "react-icons/cg";
import { getUserPostsApi } from "../../api/userPost";
import { deletePostApi } from "../../api/post";

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
      const response = await getUserPostsApi(authHeader());
      const allPosts = [...response.response.posts.A, ...response.response.posts.B];
      if (response.status === "success") {
        setPosts(allPosts);
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

      <section className="my-[55px] bg-[#202427] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[24px] font-bold text-[#F9FAFB] mb-3">Posts</h1>

            <Link
              to={`/posts/create`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
            >
              <CgMathPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Post
            </Link>
          </div>

          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-900">
                  <thead className="bg-white bg-opacity-5">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-start text-sm font-semibold text-white sm:pl-6">
                        Title
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-white">
                        Slug
                      </th>
                      <th scope="col" className="relative py-3.5 pr-3 pl-4 sm:pl-6">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 bg-white bg-opacity-10">
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <p className="font-medium text-white">{post.title}</p>
                        </td>
                        <td className="whitespace-nowrap py-4 pr-4 pl-3 text-sm sm:pr-6">
                          <p className="font-medium text-white">{post.slug}</p>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link to={`/posts/update/${post.id}`} className="text-gray-300 hover:text-gray-400">
                            Edit <span className="sr-only">, {post.title}</span>
                          </Link>
                          <Link className="text-red-300 hover:text-gray-400 ml-3" onClick={() => handleDeleteClick(post.id)}>
                            Delete <span className="sr-only"></span>
                          </Link>

                        {showConfirmation && (
                          <div className="fixed z-10 inset-0 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                              <div className="fixed inset-0 transition-opacity">
                                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                              </div>
                              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                              <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                  <h3 className="text-lg leading-6 font-medium text-white">Confirm Deletion</h3>
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-400">Are you sure you want to delete this item?</p>
                                  </div>
                                </div>
                                <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                  <button
                                    onClick={handleConfirmDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={handleCancelDelete}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:w-auto sm:text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}