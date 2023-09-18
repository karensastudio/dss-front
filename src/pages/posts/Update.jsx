import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { getPostByIdApi, updatePostApi } from "../../api/post";

export default function PostUpdatePage() {
  const { postId } = useParams();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [postData, setPostData] = useState();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await getPostByIdApi(authHeader(), postId);
        if (response.status === "success") {
          setPostData(response.response.post);
        } else {
          console.error("Error fetching post data:", response);
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchPostData();
  }, [postId]);


  const onSubmit = async (data) => {
    try {
      const response = await updatePostApi(authHeader(), postId, data);
      if (response.status === "success") {
        toast.success(response.message);
        navigate('/posts');
      } else {
        console.error("Error updating post:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>DSS | Edit Post</title>
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

      <section className="my-[55px] bg-[#202427] md:rounded-[12px] max-w-xl mx-auto px-[16px] md:px-[105px] py-[60px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-y-[19px] mb-[31px]">

          </div>

          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-3 px-5 rounded-full mt-4"
          >
            Edit Post
          </button>
        </form>
      </section>
    </>
  );
}
