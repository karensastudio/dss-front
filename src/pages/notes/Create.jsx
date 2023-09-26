import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { addNoteApi } from "../../api/comment";
import { getPostsApi } from "../../api/post";
import Select from 'react-select';
import { useTheme } from "../../context/ThemeContext";

export default function NoteCreatePage() {
  const { isLightMode } = useTheme();
  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);
  

  const fetchPosts = async () => {
    try {
      const response = await getPostsApi(authHeader());
      if (response.status === "success") {
        const postOptions = response.response.posts.map((post) => ({
          value: post.id.toString(),
          label: post.title,
        }));
        setPosts(postOptions)
      } else {
        console.error("Error fetching post data:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
    }
  };

  const onSubmit = async (data) => {
    const noteData = {
      note: data.note,
      post_id: selectedPost ? selectedPost.value : null,
    };
    try {
      const response = await addNoteApi(authHeader(), noteData);
      if (response.status === "success") {
        toast.success(response.message);
        navigate('/notes')
      } else {
        console.error("Error creating note:", response);
        toast.error(response.message);
      }
      } catch (error) {
        console.error("Error:", error);
      }

  };

  return (
    <>
      <Helmet>
        <title>DSS | Create Note</title>
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
      <section className={`my-[55px] md:rounded-[12px] max-w-xl mx-auto px-[16px] md:px-[105px] py-[60px] bg-white text-[#111315] dark:bg-[#202427] dark:text-white`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-y-[19px] mb-[31px]">
            <Input
              name={'note'}
              title={"Note"}
              type={'text'}
              register={register}
              getValues={getValues}
              rootClasses={'col-span-2 md:col-span-1'}
            />
          </div>
          <div className="flex-1 mt-4">
            <Select
            defaultValue={selectedPost}
            onChange={(selectedOption) => setSelectedPost(selectedOption)}
            options={posts}
            className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
            classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
            placeholder={<div>Posts</div>}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-3 px-5 rounded-full mt-4"
          >
            Create Note
          </button>
        </form>
      </section>
      </div>
    </>
  );
}
