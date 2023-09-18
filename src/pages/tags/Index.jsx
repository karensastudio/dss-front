import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createTagApi, getTagByIdApi, getTagsApi, updateTagApi } from "../../api/tag";
import { Link } from "react-router-dom";
import { CgMathPlus } from "react-icons/cg";

export default function TagIndexPage() {

  const authHeader = useAuthHeader();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchPostsData();
  }, []);


  const fetchPostsData = async () => {
    try {
      const response = await getTagsApi(authHeader());
      if (response.status === "success") {
        setTags(response.response.tags);
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
        <title>DSS | Tags</title>
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
            <h1 className="text-[24px] font-bold text-[#F9FAFB] mb-3">Tags</h1>

            <Link
              to={`/tags/create`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
            >
              <CgMathPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Tag
            </Link>
          </div>

          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-900">
                  <thead className="bg-white bg-opacity-5">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-start text-sm font-semibold text-white sm:pl-6">
                        Name
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
                    {tags.map((tag) => (
                      <tr key={tag.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <p className="font-medium text-white">{tag.name}</p>
                        </td>
                        <td className="whitespace-nowrap py-4 pr-4 pl-3 text-sm sm:pr-6">
                          <p className="font-medium text-white">{tag.slug}</p>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link to={`/tags/${tag.id}`} className="text-gray-300 hover:text-gray-400">
                            Edit <span className="sr-only">, {tag.name}</span>
                          </Link>
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