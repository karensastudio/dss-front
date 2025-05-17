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

import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createPostApi, getPostsApi } from "../../api/post";
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { createTagApi, getTagsApi } from "../../api/tag";

import { APIUploadFile } from "../../api/uploader";
import { getUserPostsApi } from "../../api/userPost";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router";
import { usePermify } from '@permify/react-role';
import { ImSpinner8 } from "react-icons/im";
import { 
  FiSave, 
  FiType, 
  FiAlignLeft, 
  FiList, 
  FiImage, 
  FiChevronDown, 
  FiLink, 
  FiTable, 
  FiAlertTriangle, 
  FiCode 
} from "react-icons/fi";

export default function PostCreatePage() {
  const { isAuthorized, isLoading } = usePermify();

  const { isLightMode } = useTheme();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);
  const [relatedOptions, setRelatedOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedRelated, setSelectedRelated] = useState(null);

  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const ReactEditorJS = createReactEditorJS();
  const [editorData, setEditorData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      setIsRelatedLoading(true);

      if (!await isAuthorized(["admin", "super-admin"], [])) {
        navigate('/')
        return;
      };
      
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
          // extract children posts to flat 
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

          const allRelatedPosts = [...relatedResponse.response.posts];
          const relatedOptions = allRelatedPosts.map((post) => ({
            value: post.id.toString(),
            label: post.title,
          }));
          setRelatedOptions(relatedOptions);
          setIsRelatedLoading(false);
        } else {
          console.error("Error fetching parent options:", parentResponse);
          toast.error(parentResponse.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
    
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      // Save with Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
      
      // Cancel with Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        if (window.confirm('Discard changes and exit?')) {
          navigate('/admin/posts');
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const editorCore = useRef(null)

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance
  }, [])

  const handleReady = () => {
    const editor = editorCore.current._editorJS;
    new DragDrop(editor);
    setIsEditorLoading(false);
  };

  const onSubmit = async (data, shouldExit = true) => {
    setIsSaving(true);
    const description = await editorCore.current.save();
    const selectedTagValues = selectedTag?.map((tag) => tag.value);
    const selectedRelatedValues = selectedRelated?.map((related) => related.value);

    const postData = {
      title: data.title,
      priority: data.priority,
      description: JSON.stringify(description),
      parent_id: selectedParent ? selectedParent.value : null,
      related: selectedRelatedValues,
      tags: selectedTagValues,
    };

    try {
      const response = await createPostApi(authHeader(), postData);
      if (response.status === "success") {
        toast.success(response.message);
        if (shouldExit) {
          navigate('/admin/posts');
        }
      } else {
        console.error("Error creating post:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
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
      setSelectedTag([...selectedTag, newTag]);
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
        {isPageLoading ? (
          <div className="my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px] bg-neutral-100 shadow border border-white dark:border-neutral-700 text-[#202427] dark:bg-[#202427] dark:text-white flex justify-center items-center">
            <div className="flex flex-col items-center">
              <ImSpinner8 className="animate-spin h-10 w-10 text-blue-500 mb-4" />
              <p className="text-lg">Loading data...</p>
            </div>
          </div>
        ) : (
          <section className={`my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[42px] py-[60px] bg-neutral-100 shadow border border-white dark:border-neutral-700 text-[#202427] dark:bg-[#202427] dark:text-white`}>
            <form onSubmit={handleSubmit(data => onSubmit(data, true))} className="flex flex-col md:flex-row gap-6">
              {/* Main content column */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      {...register("title", { required: "Title is required" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <input
                      {...register("priority", { required: "Priority is required" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="w-full bg-white rounded text-black relative">
                  {isEditorLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <ImSpinner8 className="animate-spin h-8 w-8 text-blue-500 mb-2" />
                        <span className="text-sm text-gray-600">Loading editor...</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-b border-gray-200 px-3 py-2 flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('header', { level: 2 })}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Heading"
                    >
                      <FiType className="h-5 w-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('paragraph')}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Paragraph"
                    >
                      <FiAlignLeft className="h-5 w-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('list', { style: 'unordered' })}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Bullet List"
                    >
                      <FiList className="h-5 w-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('Image')}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Image"
                    >
                      <FiImage className="h-5 w-5" />
                    </button>
                    <div className="h-5 border-l border-gray-300 mx-1"></div>
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('table')}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Table"
                    >
                      <FiTable className="h-5 w-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('linkTool')}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Link"
                    >
                      <FiLink className="h-5 w-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('warning')}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Warning"
                    >
                      <FiAlertTriangle className="h-5 w-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editorCore.current && editorCore.current._editorJS.blocks.insert('raw')}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Add Raw HTML"
                    >
                      <FiCode className="h-5 w-5" />
                    </button>
                  </div>
                  
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
                          },
                          // Enable image resizing and display options
                          withBorder: true,
                          withBackground: true,
                          stretched: true,
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
              </div>
              
              {/* Sidebar - metadata column */}
              <div className="w-full md:w-80 space-y-6 md:sticky md:top-4 md:self-start">
                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">Post Metadata</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tags
                      </label>
                      <Creatable
                        defaultValue={selectedTag}
                        value={selectedTag}
                        onChange={setSelectedTag}
                        options={tagOptions}
                        isLoading={isTagLoading}
                        isClearable={true}
                        onCreateOption={handleCreate}
                        isMulti
                        className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
                        classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
                        placeholder={<div>Select or create tags...</div>}
                      />
                      <p className="text-xs text-gray-500 mt-1">Use tags to categorize your post. You can create new tags by typing.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Parent Post
                      </label>
                      <Select
                        defaultValue={selectedParent}
                        value={selectedParent}
                        onChange={(selectedOption) => setSelectedParent(selectedOption)}
                        options={parentOptions}
                        className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
                        classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
                        placeholder={<div>Select a parent post...</div>}
                      />
                      <p className="text-xs text-gray-500 mt-1">Select a parent to place this post in a hierarchy.</p>
                    </div>

                    <div className="space-y-2 relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Related Posts
                      </label>
                      {isRelatedLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex items-center justify-center mt-6">
                          <ImSpinner8 className="animate-spin h-6 w-6 text-blue-500" />
                        </div>
                      )}
                      <Select
                        defaultValue={selectedRelated}
                        value={selectedRelated}
                        onChange={setSelectedRelated}
                        options={relatedOptions}
                        isClearable={true}
                        isMulti
                        isLoading={isRelatedLoading}
                        className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
                        classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
                        placeholder={<div>Select related posts...</div>}
                      />
                      <p className="text-xs text-gray-500 mt-1">Connect this post to related content.</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyboard Shortcuts</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>Ctrl+S / ⌘+S</div>
                      <div>Save changes</div>
                      <div>Esc</div>
                      <div>Cancel editing</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-md z-20 flex justify-between mt-6 md:hidden">
                <button
                  type="button"
                  onClick={() => navigate('/admin/posts')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleSubmit(data => {
                      onSubmit(data, false);
                      toast.success("Post created successfully. You can continue editing.");
                    })}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Create & Continue
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-md text-white flex items-center ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSaving ? (
                      <>
                        <ImSpinner8 className="animate-spin h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 mr-2" />
                        Create & Exit
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Fixed bottom save bar for desktop */}
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-md z-20 hidden md:flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/admin/posts')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleSubmit(data => {
                      onSubmit(data, false);
                      toast.success("Post created successfully. You can continue editing.");
                    })}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Create & Continue
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-md text-white flex items-center ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSaving ? (
                      <>
                        <ImSpinner8 className="animate-spin h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 mr-2" />
                        Create & Exit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}
      </div>
    </>
  );
}
