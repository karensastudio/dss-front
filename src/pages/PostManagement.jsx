import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createPostApi, updatePostApi, getPostByIdApi } from "../api/post";
import Select from 'react-select';
import { getTagsApi } from "../api/tag";
import { Categories } from "../data/posts/Categories";
import { Priorities } from "../data/posts/Priorities";

import { Editor } from "@tinymce/tinymce-react";
import { APIUploadFile } from "../api/uploader";

const example_image_upload_handler = (blobInfo, progress) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://51.15.192.255:8080/api/v1/files/upload');

  xhr.upload.onprogress = (e) => {
    progress(e.loaded / e.total * 100);
  };

  xhr.onload = () => {
    if (xhr.status === 403) {
      reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
      return;
    }

    if (xhr.status < 200 || xhr.status >= 300) {
      reject('HTTP Error: ' + xhr.status);
      return;
    }

    const json = JSON.parse(xhr.responseText);
    const fileJson = json.file;

    if (!fileJson || typeof fileJson.url != 'string') {
      reject('Invalid JSON: ' + xhr.responseText);
      return;
    }

    resolve(fileJson.url);
  };

  xhr.onerror = () => {
    reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
  };

  const formData = new FormData();
  formData.append('file', blobInfo.blob(), blobInfo.filename());

  xhr.send(formData);
});


export default function PostManagementPage({ postId }) {

  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const [selectedCategoty, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

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

    console.log(postData);
    // try {
    //   if (isUpdate) {
    //     const response = await updatePostApi(authHeader(), postId, postData);
    //     if (response.status === "success") {
    //       toast.success(response.message);
    //     } else {
    //       console.error("Error updating post:", response);
    //       toast.error(response.message);
    //     }
    //   } else {
    //     const response = await createPostApi(authHeader(), postData);
    //     if (response.status === "success") {
    //       toast.success(response.message);
    //     } else {
    //       console.error("Error creating post:", response);
    //       toast.error(response.message);
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    // }
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

      <section className="my-[55px] bg-[#202427] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px]">
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

          <Editor
            apiKey='wbb8vh1ley0gypycs4vg2itj4ithfn8yq1ovtizf9zo97pvm'
            onInit={(evt, editor) => editorRef.current = editor}
            init={{
              height: 500,
              menubar: false,
              content_css: 'dark',
              skin: 'oxide-dark',
              relative_urls: true,
              document_base_url: 'https://dss-beta.netlify.app/',
              branding: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks |' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | image | table',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              images_replace_blob_uris: true,
              paste_data_images: false,
              images_upload_url: 'http://51.15.192.255:8080/api/v1/files/upload',
              images_upload_handler: example_image_upload_handler
            }}
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
