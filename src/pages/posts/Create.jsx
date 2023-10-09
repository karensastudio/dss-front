import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createPostApi, updatePostApi, getPostByIdApi, getPostsApi } from "../../api/post";
import Select from 'react-select';
import { getTagsApi } from "../../api/tag";

import { Editor } from "@tinymce/tinymce-react";
import { APIUploadFile } from "../../api/uploader";
import { getUserPostsApi } from "../../api/userPost";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router";

import { createReactEditorJS } from "react-editor-js";
import Image from '@editorjs/image';

const example_image_upload_handler = (blobInfo, progress) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.dssproject.me/api/v1/files/upload');

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


export default function PostCreatePage() {
  const { isLightMode } = useTheme();
  const navigate = useNavigate();
  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [relatedOptions, setRelatedOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedRelated, setSelectedRelated] = useState(null);

  const ReactEditorJS = createReactEditorJS();
  const [editorData, setEditorData] = useState(null);

  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tagResponse = await getTagsApi(authHeader());
        if (tagResponse.status === "success") {
          const tagOptions = tagResponse.response.tags.map((tag) => ({
            value: tag.id.toString(),
            label: tag.name,
          }));
          setTagOptions(tagOptions);
        } else {
          console.error("Error fetching tag options:", tagResponse);
          toast.error(tagResponse.message);
        }

        const parentResponse = await getUserPostsApi(authHeader());
        const relatedResponse = await getPostsApi(authHeader());
        if (parentResponse.status === "success") {
          const allParentPosts = [...parentResponse.response.posts];
          const parentOptions = allParentPosts.map((post) => ({
            value: post.id.toString(),
            label: post.title,
          }));
          setParentOptions(parentOptions);
          
          const allRelatedPosts = [...relatedResponse.response.posts];
          const relatedOptions = allRelatedPosts.map((post) => ({
            value: post.id.toString(),
            label: post.title,
          }));
          setRelatedOptions(relatedOptions);
        } else {
          console.error("Error fetching parent options:", parentResponse);
          toast.error(parentResponse.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  const onSubmit = async (data) => {
    const description = editorRef.current.getContent();
    const selectedTagValues = selectedTag?.map((tag) => tag.value);
    const selectedRelatedValues = selectedRelated?.map((related) => related.value);

    const postData = {
      title: data.title,
      priority: data.priority,
      description: description,
      parent_id: selectedParent ? selectedParent.value : null,
      related: selectedRelatedValues,
      tags: selectedTagValues,
    };
    try {
        const response = await createPostApi(authHeader(), postData);
        if (response.status === "success") {
          toast.success(response.message);
          navigate('/posts');
        } else {
          console.error("Error creating post:", response);
          toast.error(response.message);
        }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>DSS | Create Post</title>
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
        <section className={`my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px] bg-white text-[#111315] dark:bg-[#202427] dark:text-white`}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-x-4">
          <div className="flex-1">
            <Input
              name={'title'}
              title={"Title"}
              type={'text'}
              register={register}
              getValues={getValues}
            />
          </div>

          <div className="flex-1">
            <Input
              name={'priority'}
              title={"Priority"}
              type={'text'}
              register={register}
              getValues={getValues}
            />
          </div>

          <div className="w-full mt-4 bg-white rounded text-black">
              <ReactEditorJS value={editorData} tools={{ Image: Image }} />
          </div>

          <div className="flex-1 mt-4">
            <Select
            defaultValue={selectedTag}
            onChange={setSelectedTag}
            options={tagOptions}
            isClearable={true}
            isMulti
            className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
            classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
            placeholder={<div>Tags</div>}
            />
          </div>

          <div className="flex-1 mt-4">
            <Select
              defaultValue={selectedParent}
              onChange={(selectedOption) => setSelectedParent(selectedOption)}
              options={parentOptions}
              className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
              classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
              placeholder={<div>Parent</div>}
            />
          </div>

          <div className="flex-1 mt-4">
            <Select
              defaultValue={selectedRelated}
              onChange={setSelectedRelated}
              options={relatedOptions}
              isClearable={true}
              isMulti
              className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
              classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
              placeholder={<div>Related</div>}
            />
          </div>

          <div className="w-full mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full"
            >
              Create Post
            </button>
          </div>
        </form>
      </section>
    </div>          
    </>
  );
}
