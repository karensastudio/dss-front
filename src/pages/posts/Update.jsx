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
import header from '@editorjs/header';

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
import { createTagApi, getTagsApi } from "../../api/tag";
import { getUserPostsApi } from "../../api/userPost";
import { useTheme } from "../../context/ThemeContext";
import { APIUploadFile } from '../../api/uploader';
import Creatable from 'react-select/creatable';

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

  const [isTagLoading, setIsTagLoading] = useState(false);

  const ReactEditorJS = createReactEditorJS();
  const [editorData, setEditorData] = useState(null);

  useEffect(() => {
    // Create a combined fetch function
    const fetchAllData = async () => {
      try {
        // First fetch post data
        const response = await getPostByIdApi(authHeader(), postId);
        if (response.status === "success") {
          const post = response.response.post;
          setPostData(post);
          setValue("title", post.title);
          setValue("priority", post.priority);
          setEditorContent(JSON.parse(post.description));
          setEditorData(JSON.parse(post.description));
          setSelectedTags(post.tags.map((tag) => ({ value: tag.id.toString(), label: tag.name })));
          
          if (post.parent && post.parent.id) {
            setSelectedParent({ value: post.parent.id, label: post.parent.title });
          }
          
          // Save the related posts for later synchronization
          const postRelated = post.related.map((related) => ({ 
            value: related.id.toString(), 
            label: related.title 
          }));
          
          // Now fetch all options
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
          if (parentResponse.status === "success" && relatedResponse.status === "success") {
            // Process parent options
            const allParentPosts = [...parentResponse.response.posts];
            const parentOptions = allParentPosts.map((post) => ({
              value: post.id.toString(),
              label: post.title,
            }));
            // append all children posts to parent options
            allParentPosts.forEach((post) => {
              if (post.children.length > 0) {
                post.children.forEach((child) => {
                  parentOptions.push({
                    value: child.id.toString(),
                    label: child.title,
                  });
                });
              }
            });
            setParentOptions(parentOptions);

            // Process related options
            const allRelatedPosts = [...relatedResponse.response.posts];
            const relatedOptions = allRelatedPosts.map((post) => ({
              value: post.id.toString(),
              label: post.title,
            }));
            setRelatedOptions(relatedOptions);
            
            // IMPORTANT: Only set selectedRelated after options are loaded
            // This ensures that the Select component can find the selected values
            setSelectedRelated(postRelated);
          } else {
            console.error("Error fetching parent options:", parentResponse);
            toast.error(parentResponse.message);
          }
        } else {
          console.error("Error fetching post data:", response);
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
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
        navigate('/admin/posts');
      } else {
        console.error("Error updating post:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreate = async (inputValue) => {
    setIsTagLoading(true);
    const response = await createTagApi(authHeader(), { name: inputValue });
    if (response.status === "success") {
      toast.success(response.message);
      const newTag = {
        value: response.response.tag.id.toString(),
        label: response.response.tag.name,
      };
      setSelectedTags([...selectedTags, newTag]);
      setTagOptions([...tagOptions, newTag]);
      setIsTagLoading(false);
    } else {
      console.error("Error creating tag:", response);
      toast.error(response.message);
    }
  }


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
        <section className={`my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px] bg-neutral-100 shadow border border-white dark:border-neutral-700 text-[#202427] dark:bg-[#202427] dark:text-white`}>
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
                  header: {
                    class: header,
                    inlineToolbar: true,
                    config: {
                      placeholder: 'Enter a header',
                      levels: [2, 3, 4],
                      defaultLevel: 3
                    }
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
                      endpoint: `${import.meta.env.VITE_API_BASE}/api/v1/meta-data`, // Using environment variable for endpoint
                    }
                  }
                }}
              />
            </div>

            <div className="flex w-full space-x-5">

              <div className="flex-1 mt-4">
                <Creatable
                  defaultValue={selectedTags}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  options={tagOptions}
                  isLoading={isTagLoading}
                  isClearable={true}
                  onCreateOption={handleCreate}
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
              Save
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
