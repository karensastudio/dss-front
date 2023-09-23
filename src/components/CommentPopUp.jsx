import React, { useState, useEffect } from "react";
import { useAuthHeader } from "react-auth-kit";
import { BsXLg } from "react-icons/bs";
import { addNoteApi, proposeToEditorApi } from "../api/comment";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

function CommentPopUp({ type, postId, onClose }) {
  const { isLightMode } = useTheme();
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
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full comment-popup">
          <div className={`${isLightMode ? 'bg-gray-200 text-[#111315]' : 'bg-gray-900 text-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
            <div className="mx-[40px] py-[16px]">
              <button
                onClick={handleClose}
                className="absolute top-0 right-0 m-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <BsXLg />
              </button>
              <h2 className="text-[18px] leading-[24px] mb-[24px]">
                Add a note, to go into your report
              </h2>

              <textarea
                name="comment"
                value={message}
                onChange={handleTextareaChange}
                className="w-full rounded-[12px] px-[25px] py-[16px]"
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
              className={`bg-[#0071FF] rounded-full text-white px-[32px] py-[15px] text-[16px] leading-[18px] font-medium min-w-fit cursor-pointer ${
              loading ? "opacity-60 pointer-events-none" : ""
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
