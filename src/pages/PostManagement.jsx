import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createPostApi, updatePostApi, getPostByIdApi } from "../api/post";
import Select from 'react-select';
import { getTagsApi } from "../api/tags";
import { Categories } from "../data/posts/Categories";
import { Priorities } from "../data/posts/Priorities";

export default function PostManagementPage({ postId }) {

  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const [selectedCategoty, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  const isUpdate = !!postId;

  useEffect(() => {
    if (isUpdate) {
      fetchPostData();
    }
  }, [isUpdate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTagsApi(authHeader());
        if (response.status === "success") {
          console.log(response);
          const tagOptions = response.response.tags.map((tag) => ({
            value: tag.id.toString(),
            label: tag.name,
          }));
          setTagOptions(tagOptions);
        } else {
          console.error("Error fetching tag options:", response);
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error fetching tag options:", error);
      }
    };

    fetchData();
  }, []);


  const onSubmit = async (data) => {
    const postData = {
      title: data.title,
      category: selectedCategoty,
      priority: selectedPriority,
      description: data.description,
      parent_id: null,
      tags: [0],
    };

    try {
      if (isUpdate) {
        const response = await updatePostApi(authHeader(), postId, postData);
        if (response.status === "success") {
          toast.success(response.message);
        } else {
          console.error("Error updating post:", response);
          toast.error(response.message);
        }
      } else {
        const response = await createPostApi(authHeader(), postData);
        if (response.status === "success") {
          toast.success(response.message);
        } else {
          console.error("Error creating post:", response);
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPostData = async () => {
    try {
      const response = await getPostByIdApi(authHeader(), postId);
      if (response.status === "success") {
        const postData = response.data;
        getValues("title", postData.title);
        getValues("category", postData.category);
        getValues("priority", postData.priority);

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
        <title>DSS | {isUpdate ? "Edit Post" : "Create Post"}</title>
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
            <Input
              name={'title'}
              title={"Title"}
              type={'text'}
              register={register}
              getValues={getValues}
              rootClasses={'col-span-2 md:col-span-1'}
            />

          <Select
            defaultValue={selectedCategoty}
            onChange={setSelectedCategory}
            options={Categories}
            className="dark" 
            isClearable={true}
            placeholder={<div>Categories</div>}
            />

          <Select
            defaultValue={selectedPriority}
            onChange={setSelectedPriority}
            options={Priorities}
            isClearable={true}
           placeholder={<div>Priorities</div>}
            />

          <Select
          defaultValue={selectedTag}
          onChange={setSelectedTag}
          options={tagOptions}
          isClearable={true}
          isMulti
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={<div>Tags</div>}
          />

          </div>


          <Input
              name={'description'}
              title={"Description"}
              type={'text'}
              register={register}
              getValues={getValues}
              rootClasses={'col-span-2 md:col-span-1'}
            />

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full mt-4"
          >
            {isUpdate ? "Update Post" : "Create Post"}
          </button>
        </form>
      </section>
    </>
  );
}
