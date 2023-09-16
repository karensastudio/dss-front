import React, { useRef } from "react";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createPostApi } from "../api/post";



export default function PostPage() {
  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();

  const onSubmit = async (data) => {
    const postData = {
        title: data.title,
        category: data.category,
        priority: data.priority,
        description: "description test",
        parent_id: null,
        tags: [0],
      };
    try {
      const response = await createPostApi(authHeader(), postData);
      if (response.status === "success") {
        toast.success(response.message);
        } else {
        console.error("Error creating post:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };


  return (
    <>
      <Helmet>
        <title>DSS | Post</title>
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
            rootClasses={'col-span-2 md:col-span-1'} />

        <Input
            name={'category'}
            title={"Category"}
            type={'text'}
            register={register}
            getValues={getValues}
            rootClasses={'col-span-2 md:col-span-1'} />

            <div className="flex items-center gap-x-4">
            <label className="text-white">Priority:</label>
            <div>
                <label>
                <input
                    type="radio"
                    name="priority"
                    value="1"
                    {...register("priority", { required: true })}
                />{' '}
                <span className="text-white">High</span>
                </label>
                <label>
                <input
                    type="radio"
                    name="priority"
                    value="0"
                    {...register("priority", { required: true })}
                />{' '}
                <span className="text-white">Low</span>
                </label>
            </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full mt-4"
          >
            Create Post
          </button>
        </form>
      </section>
    </>
  );
}
