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
import LinkTool from '@editorjs/link';

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { getPostByIdApi, getPostsApi, updatePostApi } from "../../api/post";
import Select from 'react-select';
import { getTagsApi } from "../../api/tag";
import { getUserPostsApi } from "../../api/userPost";
import { useTheme } from "../../context/ThemeContext";

export default function PostUpdatePage() {
  const { isLightMode } = useTheme();
  const { postId } = useParams();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [postData, setPostData] = useState({});
  const [editorContent, setEditorContent] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [relatedOptions, setRelatedOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState();
  const [selectedRelated, setSelectedRelated] = useState(null);

  const ReactEditorJS = createReactEditorJS();
  const [editorData, setEditorData] = useState(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await getPostByIdApi(authHeader(), postId);
        if (response.status === "success") {
          const post = response.response.post;
          setPostData(post);
          setValue("title", post.title);
          setValue("priority", post.priority);
          setEditorContent(JSON.parse(post.description));
          setEditorData(JSON.parse(post.description));
          setSelectedTags(post.tags.map((tag) => ({ value: tag.id.toString(), label: tag.name })));
          setSelectedParent({ value: response.response.post.parent.id, label: response.response.post.parent.title })
          setSelectedRelated(post.related.map((related) => ({ value: related.id.toString(), label: related.title })));
        } else {
          console.error("Error fetching post data:", response);
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

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

    fetchPostData();
    fetchData();
  }, [postId]);

  const editorCore = useRef(null)

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance
  }, [])

  const handleReady = () => {
    const editor = editorCore.current._editorJS;
    new DragDrop(editor);
  };

  const onSubmit = async (data) => {
    const selectedRelatedValues = selectedRelated?.map((related) => related.value);
    const description = await editorCore.current.save();

    try {
      const postData = {
        title: data.title,
        priority: data.priority,
        description: JSON.stringify(description),
        parent_id: selectedParent ? selectedParent.value : null,
        related: selectedRelatedValues,
        tags: selectedTags.map((tag) => tag.value),
      };
      console.log(postData);

      const response = await updatePostApi(authHeader(), postId, postData);
      if (response.status === "success") {
        toast.success(response.message);
        navigate('/posts');
      } else {
        console.error("Error updating post:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>DSS | Edit Post</title>
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
        <section className={`bg-white text-[#111315] dark:bg-[#202427] dark:text-white my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px]`}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-x-4">
            <div className="flex-1">
              <Input
                name={'title'}
                title={"Title"}
                type={'text'}
                register={register}
                defaultValue={postData?.title}
              />
            </div>

            <div className="flex-1">
              <Input
                name={'priority'}
                title={"Priority"}
                type={'text'}
                register={register}
                defaultValue={postData?.priority}
              />
            </div>

            <div className="w-full mt-4 bg-white rounded text-black">
              <ReactEditorJS
                onInitialize={handleInitialize}
                onReady={handleReady}
                defaultValue={editorContent}
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
                  },
                  linkTool: {
                    class: LinkTool,
                    config: {
                      endpoint: 'http://51.15.192.255:8080/api/v1/meta-data', // Your backend endpoint for url data fetching
                    }
                  }
                }}
              />
            </div>

            <div className="flex w-full space-x-5">

              <div className="flex-1 mt-4">
                <Select
                  defaultValue={selectedTags}
                  value={selectedTags}
                  onChange={setSelectedTags}
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
                  value={selectedParent}
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
                  value={selectedRelated}
                  onChange={setSelectedRelated}
                  options={relatedOptions}
                  isClearable={true}
                  isMulti
                  className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
                  classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
                  placeholder={<div>Related</div>}
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm py-3 px-5 rounded-full mt-4"
            >
              Edit Post
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
