import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createTagApi, getTagByIdApi, updateTagApi } from "../../api/tag";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function TagCreatePage({ tagId }) {
  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const navigate = useNavigate();

  const isUpdate = !!tagId;

  useEffect(() => {
    if (isUpdate) {
      fetchPostData();
    }
  }, [isUpdate]);


  const onSubmit = async (data) => {
    const tagData = {
      name: data.name,
    };

    try {
      if (isUpdate) {
        const response = await updateTagApi(authHeader(), tagId, tagData);
        if (response.status === "success") {
          toast.success(response.message);
          navigate('/admin/tags');
        } else {
          console.error("Error updating tag:", response);
          toast.error(response.message);
        }
      } else {
        const response = await createTagApi(authHeader(), tagData);
        if (response.status === "success") {
          toast.success(response.message);
          navigate('/admin/tags');
        } else {
          console.error("Error creating tag:", response);
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPostData = async () => {
    try {
      const response = await getTagByIdApi(authHeader(), tagId);
      if (response.status === "success") {
        const postData = response.data;
        getValues("name", postData.name);

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
        <title>DSS | {isUpdate ? "Edit Tag" : "Create Tag"}</title>
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
              name={'name'}
              title={"Name"}
              type={'text'}
              register={register}
              getValues={getValues}
              rootClasses={'col-span-2 md:col-span-1'}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-3 px-5 rounded-full mt-4"
          >
            Save
          </button>
        </form>
      </section>
      </div>
    </>
  );
}
