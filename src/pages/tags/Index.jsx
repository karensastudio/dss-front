import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createTagApi, getTagByIdApi, getTagsApi, updateTagApi } from "../../api/tag";

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
      </section>
    </>
  );
}
