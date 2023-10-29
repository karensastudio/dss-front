import React, { useState, useEffect } from "react";
import { useAuthHeader } from "react-auth-kit";
import { BsXLg } from "react-icons/bs";
import { addNoteApi, proposeToEditorApi } from "../api/comment";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { XMarkIcon } from '@heroicons/react/24/outline'

function CommentPopUp({ type, postId, onClose }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const authHeader = useAuthHeader();

  useEffect(() => {
    setMessage("");
    setLoading(false);
  }, [type]);

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  const handleCreateComment = async () => {
    setLoading(true);

    const apiFunction = type === "propose" ? proposeToEditorApi : addNoteApi;

    const commentData = {
      post_id: postId,
      [type]: message,
    };

    try {
      const response = await apiFunction(authHeader(), commentData);
      if (response.status === "success") {
        toast.success(response.message);
        setMessage("");
      } else {
        console.error("Error creating comment:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while creating the comment.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity"
        onClick={handleClose}
        >
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full comment-popup">
          <div className={`bg-white text-[#111315] dark:bg-gray-900 dark:text-white`}>
            <div className="bg-neutral-200 px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold capitalize leading-6 text-neutral-900">
                  Add a note, to go into your report
                </p>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="relative p-2 rounded-full bg-neutral-300 text-neutral-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={handleClose}
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-6">
              <textarea
                name="comment"
                value={message}
                onChange={handleTextareaChange}
                className="block w-full text-lg px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0071FF] sm:text-sm sm:leading-6"
                placeholder="Write note ..."
                cols="30"
                rows="4"
              ></textarea>
            </div>

            <div className="mx-[40px] py-[24px] flex items-center justify-between">
              <p className="text-[18px] leading-[24px] mr-[10px]">
                Would you like to add a Consideration, Tech Note, Case Study
                etc. to the system?
              </p>

              <div
                className={`bg-[#0071FF] rounded-full text-white px-[32px] py-[15px] text-[16px] leading-[18px] font-medium min-w-fit cursor-pointer ${loading ? "opacity-60 pointer-events-none" : ""
                  }`}
                onClick={handleCreateComment}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <CgSpinner className="text-white text-[20px] animate-spin" />
                  </div>
                ) : type === "propose" ? (
                  <>Propose to editor</>
                ) : (
                  <>Add your note</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentPopUp;
