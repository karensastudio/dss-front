import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { getTagByIdApi, updateTagApi } from "../../api/tag";
import { useTheme } from "../../context/ThemeContext";

export default function TagUpdatePage() {
  const { tagId } = useParams();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [tagData, setTagData] = useState();

  useEffect(() => {
    const fetchTagData = async () => {
      try {
        const response = await getTagByIdApi(authHeader(), tagId);
        if (response.status === "success") {
          setTagData(response.response.tag);
        } else {
          console.error("Error fetching tag data:", response);
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error fetching tag data:", error);
      }
    };

    fetchTagData();
  }, [tagId]);


  const onSubmit = async (data) => {
    try {
      const response = await updateTagApi(authHeader(), tagId, data);
      if (response.status === "success") {
        toast.success(response.message);
        navigate('/tags');
      } else {
        console.error("Error updating tag:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>DSS | Edit Tag</title>
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
      <section className={`bg-white text-[#111315] dark:bg-[#202427] dark:text-white my-[55px] md:rounded-[12px] max-w-xl mx-auto px-[16px] md:px-[105px] py-[60px]`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-y-[19px] mb-[31px]">
            <Input
              name="name"
              title="Name"
              type="text"
              register={register}
              defaultValue={tagData?.name}
              rootClasses="col-span-2 md:col-span-1"
            />
              <Input
              name="slug"
              title="Slug"
              type="text"
              register={register}
              defaultValue={tagData?.slug}
              rootClasses="col-span-2 md:col-span-1"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-3 px-5 rounded-full mt-4"
          >
            Edit Tag
          </button>
        </form>
      </section>
      </div>
    </>
  );
}
