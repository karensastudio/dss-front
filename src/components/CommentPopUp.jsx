import React, { useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { BsX, BsXLg } from "react-icons/bs";
import { createCommentApi } from "../api/comment";

function CommentPopUp({ onClose }) {
  const [message, setMessage] = useState("");
  const authHeader = useAuthHeader();

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  const handleCreateComment = async () => {
    console.log('create comment');
    // try {
    //     const response = await createCommentApi(authHeader(), message);
    //     if (response.status === "success") {
    //       toast.success(response.message);
    //     } else {
    //       console.error("Error creating post:", response);
    //       toast.error(response.message);
    //     }
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  }

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full comment-popup">
          <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mx-[40px] py-[16px]">
              <button
                onClick={handleClose}
                className="absolute top-0 right-0 m-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <BsXLg />
              </button>
              <h2 className="text-[18px] text-white leading-[24px] mb-[24px]">
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
              <p className="text-white text-[18px] leading-[24px] mr-[10px]">
                Would you like to add a Consideration, Tech Note, Case Study
                etc. to the system?
              </p>

              <div className="bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium min-w-fit" onClick={handleCreateComment}>
                Propose to editor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentPopUp;
