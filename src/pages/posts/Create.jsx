import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createPostApi, updatePostApi, getPostByIdApi } from "../../api/post";
import Select from 'react-select';
import { getTagsApi } from "../../api/tag";

import { Editor } from "@tinymce/tinymce-react";
import { APIUploadFile } from "../../api/uploader";
import { getUserPostsApi } from "../../api/userPost";

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


export default function PostCreatePage() {

  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);

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
        if (parentResponse.status === "success") {
          const allPosts = [...parentResponse.response.posts];
          const parentOptions = allPosts.map((post) => ({
            value: post.id.toString(),
            label: post.title,
          }));
          setParentOptions(parentOptions);
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

    const postData = {
      title: data.title,
      priority: data.priority,
      description: description,
      parent_id: selectedParent ? selectedParent.value : null,
      tags: selectedTagValues,
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

      <section className="my-[55px] bg-[#202427] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px]">
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

          <div className="w-full mt-4">
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
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks |' +
                  'bold italic forecolor link | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | image | table code',
                content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }',
                images_replace_blob_uris: true,
                paste_data_images: false,
                images_upload_url: 'https://api.dssproject.me/api/v1/files/upload',
                images_upload_handler: example_image_upload_handler
              }}
            />
          </div>
          <div className="flex-1 mt-4">
            <Select
            defaultValue={selectedTag}
            onChange={setSelectedTag}
            options={tagOptions}
            isClearable={true}
            isMulti
            className="basic-multi-select"
            classNamePrefix="dark-select"
            placeholder={<div>Tags</div>}
            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999, position: 'relative' }) }}
            />
          </div>

          <div className="flex-1 mt-4">
            <Select
              defaultValue={selectedParent}
              onChange={(selectedOption) => setSelectedParent(selectedOption)}
              options={parentOptions}
              className="basic-select"
              classNamePrefix="dark-select"
              placeholder={<div>Parent</div>}
              styles={{ menu: (provided) => ({ ...provided, zIndex: 9999, position: 'relative' }) }}
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

    </>
  );
}
