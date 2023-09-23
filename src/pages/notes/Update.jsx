import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { getNoteByIdApi, updateNoteApi } from "../../api/comment";
import Select from 'react-select';
import { getPostsApi } from "../../api/post";
import { CgSpinner } from "react-icons/cg";
import { useTheme } from "../../context/ThemeContext";

export default function NoteUpdatePage() {
  const {isLightMode} = useTheme();
  const { noteId } = useParams();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [posts, setPosts] = useState([]);
  const [noteData, setNoteData] = useState();
  const [selectedPost, setSelectedPost] = useState({
    value: noteData?.post?.id.toString() || '',
    label: noteData?.post?.title || 'Select a Post',
  }); 

  const fetchNoteData = async () => {
    try {
      const response = await getNoteByIdApi(authHeader(), noteId);
      if (response.status === "success") {
        setNoteData(response.response.note);
        setSelectedPost({ value: response.response.note.post.id, label: response.response.note.post.title });
      } else {
        console.error("Error fetching note data:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching note data:", error);
    }
  };

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


  useEffect(() => {
    fetchNoteData();
    fetchPosts();
  }, [noteId]);

  useEffect(() => {
    if (noteData) {
      setSelectedPost({
        value: noteData.post.id.toString(),
        label: noteData.post.title,
      });
    }
  }, [noteId, noteData]);


  const onSubmit = async (data) => {
    const noteData = {
      note: data.note,
      post_id: selectedPost ? selectedPost.value : null,
    }
    try {
      setLoading(true); 
      const response = await updateNoteApi(authHeader(), noteId, noteData);
      if (response.status === "success") {
        toast.success(response.message);
        setLoading(false); 
        navigate('/notes');
      } else {
        console.error("Error updating note:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>DSS | Edit Note</title>
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
      <section className={`${isLightMode ? 'bg-white text-[#111315]' : 'bg-[#202427] text-white'} my-[55px] md:rounded-[12px] max-w-4xl mx-auto px-[16px] md:px-[105px] py-[60px]`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-y-[19px] mb-[31px]">
            <Input
              name="note"
              title="Note"
              type="text"
              register={register}
              defaultValue={noteData?.note}
              rootClasses="col-span-2 md:col-span-1"
            />
          </div>
          <div className="flex-1 mt-4">
            <Select
              defaultValue={selectedPost}
              value={selectedPost}
              onChange={(selectedOption) => setSelectedPost(selectedOption)}
              options={posts}
              className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
              classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
              placeholder={<div>Posts</div>}
            />
          </div>

          <button
            type="submit"
            className={`bg-blue-700 hover:bg-blue-800 text-white text-sm py-3 px-5 rounded-full mt-4 ${loading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <CgSpinner className="text-white text-[20px] animate-spin" />
              </div>
            ) : (
              "Edit Note"
            )}
          </button>
        </form>
      </section>
      </div>
    </>
  );
}
