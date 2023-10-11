// @ts-ignore: Workaround for CJS
import { createReactEditorJS } from 'react-editor-js/dist/react-editor-js.cjs';
import Image from '@editorjs/image';
import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Warning from '@editorjs/warning';
import Table from '@editorjs/table';
import DragDrop from 'editorjs-drag-drop';
import ToggleBlock from 'editorjs-toggle-block';
import Paragraph from "@editorjs/paragraph";
import TextVariantTune from "@editorjs/text-variant-tune";
import Raw from "@editorjs/raw";

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

let column_tools = {
  Paragraph: Paragraph,
  embed: Embed,
  table: Table,
  warning: Warning,
  list: {
    class: List,
    inlineToolbar: true,
  },
  toggle: {
    class: ToggleBlock,
    inlineToolbar: true,
  }
}

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

  const editorCore = useRef(null)

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance
  }, [])

  const handleReady = () => {
    const editor = editorCore.current._editorJS;
    new DragDrop(editor);
  };

  const onSubmit = async (data) => {
    const description = await editorCore.current.save();
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
        <section className={`my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px] bg-neutral-100 shadow border border-white dark:border-neutral-700 text-[#202427] dark:bg-[#202427] dark:text-white`}>
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
              <ReactEditorJS
                onInitialize={handleInitialize}
                onReady={handleReady}
                value={editorData}
                tunes={TextVariantTune}
                tools={{
                  textVariant: TextVariantTune,
                  raw: Raw,
                  paragraph: {
                    class: Paragraph,
                    inlineToolbar: true,
                    tunes: ['textVariant']
                  },
                  Image: {
                    class: Image,
                    inlineToolbar: true,
                    config: {
                      uploader: {
                        uploadByFile(file) {
                          return new Promise(async (resolve, reject) => {
                            try {
                              const response = await APIUploadFile(file);
                              if (response.status === "success") {
                                resolve({
                                  success: 1,
                                  file: {
                                    url: response.response.url,
                                  }
                                });
                              } else {
                                reject(response.message);
                              }
                            } catch (error) {
                              reject(error);
                            }
                          });
                        }
                      }
                    }
                  },
                  embed: Embed,
                  table: Table,
                  warning: Warning,
                  list: {
                    class: List,
                    inlineToolbar: true,
                  },
                  toggle: {
                    class: ToggleBlock,
                    inlineToolbar: true,
                  }
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
