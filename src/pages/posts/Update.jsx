import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { getPostByIdApi, updatePostApi } from "../../api/post";
import Select from 'react-select';
import { Editor } from "@tinymce/tinymce-react";
import { getTagsApi } from "../../api/tag";
import { getUserPostsApi } from "../../api/userPost";
import { useTheme } from "../../context/ThemeContext";

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


export default function PostUpdatePage() {
  const {isLightMode} = useTheme();
  const { postId } = useParams();
  const authHeader = useAuthHeader();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [postData, setPostData] = useState({});
  const [editorContent, setEditorContent] = useState("");
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState();
  const [selectedRelated, setSelectedRelated] = useState(null);

  const editorRef = useRef(null);


  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await getPostByIdApi(authHeader(), postId);
        if (response.status === "success") {
          const post = response.response.post;
          setPostData(post);
          setValue("title", post.title);
          setValue("priority", post.priority);
          setEditorContent(post.description);
          setSelectedTags(post.tags.map((tag) => ({ value: tag.id.toString(), label: tag.name })));
          setSelectedParent({ value: response.response.post.parent.id, label: response.response.post.parent.title })
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
        if (parentResponse.status === "success") {
          const parentOptions = parentResponse.response.posts.map((post) => ({
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

    fetchPostData();
    fetchData();
  }, [postId]);

  const onSubmit = async (data) => {
    const selectedRelatedValues = selectedRelated?.map((related) => related.value);
    try {
      const postData = {
        title: data.title,
        priority: data.priority,
        description: editorRef.current.getContent(),
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
      <section className={`${isLightMode ? 'bg-white text-[#111315]' : 'bg-[#202427] text-white'} my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px]`}>
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

          <div className="w-full mt-4">
            <Editor
              apiKey="wbb8vh1ley0gypycs4vg2itj4ithfn8yq1ovtizf9zo97pvm"
              initialValue={editorContent}
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
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'accordion'
                ],
                toolbar: 'undo redo | blocks |' +
                  'bold italic forecolor link | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | image | table code accordion',
                content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }',
                images_replace_blob_uris: true,
                paste_data_images: false,
                images_upload_url: 'https://api.dssproject.me/api/v1/files/upload',
                images_upload_handler: example_image_upload_handler
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
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999, position: 'relative' }) }}
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
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999, position: 'relative' }) }}
              />
            </div>
            <div className="flex-1 mt-4">
            <Select
              defaultValue={selectedRelated}
              value={selectedRelated}
              onChange={setSelectedRelated}
              options={parentOptions}
              isClearable={true}
              isMulti
              className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
              classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
              placeholder={<div>Related</div>}
              styles={{ menu: (provided) => ({ ...provided, zIndex: 9999, position: 'relative' }) }}
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
