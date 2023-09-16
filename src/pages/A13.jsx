import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BsBookmark, BsChevronLeft, BsShare } from "react-icons/bs";
import UserLayout from "../layouts/User";

export default function A13Page() {

    const navigate = useNavigate()
    const authHeader = useAuthHeader();

    return (
        <UserLayout pageTitle={'Homepage'}>
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

            <div className="w-full">
                <div className="mx-[40px] py-[24px] border-b-[1px] border-b-white flex items-center justify-between">
                    <p className="text-white text-[14px] leading-[20px] text-opacity-60">Section A | Consideration A1 | A1.3. Low participatory culture.</p>

                    <div className="flex space-x-[16px] text-white text-[18px]">
                        <BsBookmark />
                        <BsShare />
                    </div>
                </div>

                <div className="mx-[40px] py-[24px] mb-[68px] flex items-center justify-between">
                    <div className="flex items-center text-white text-opacity-60 text-[14px] leading-[20px]">
                        <BsChevronLeft className="mr-[12px]" />
                        <span>Go back</span>
                    </div>

                    <div className="flex space-x-[16px] text-white text-[18px] items-center">
                        <p className="text-white text-[16px]">
                            Add to My Decision
                        </p>
                        <span className="w-[24px] h-[24px] rounded-[4px] bg-[#2B2F33] ml-[10px] inline-flex"></span>
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">
                    <h1 className="text-white text-[24px] leading-[32px]">A1. Consider the participatory culture in the project territory.</h1>
                </div>

                <div className="mx-[40px] py-[24px]">
                    <div className="flex items-center justify-start space-x-[8px]">
                        <span className="px-[12px] py-[2px] text-[12px] leading-[20px] text-white rounded-full border-[1px] border-white">#section_a</span>
                        <span className="px-[12px] py-[2px] text-[12px] leading-[20px] text-white rounded-full border-[1px] border-white">#consideration</span>
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">

                    <h2 className="text-[18px] text-white leading-[24px] mb-[16px]">Considerations:</h2>

                    <div className="flex flex-col items-center justify-center">
                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#0071FF] w-full">
                            <p className="text-white text-[18px] leading-[24px]">A1.3.1 Is there Institutional pressure on the usage of participation? Consider how to increase it</p>
                        </div>

                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#0071FF] w-full">
                            <p className="text-white text-[18px] leading-[24px]">A1.3.2 Think about ways of initiating culture change with education, incentives or laws.</p>
                        </div>
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">

                    <h2 className="text-[18px] text-white leading-[24px] mb-[16px]">Ressources:</h2>

                    <div className="flex flex-col items-center justify-center">
                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#41474D] w-full">
                            <p className="text-white text-[18px] leading-[24px]">A1.1 Tech Note</p>
                        </div>
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">

                    <h2 className="text-[18px] text-white leading-[24px] mb-[16px]">Add a note, to go into your report</h2>

                    <textarea name="comment" className="w-full rounded-[12px] px-[25px] py-[16px]" placeholder="Write note ..." cols="30" rows="1"></textarea>
                </div>

                <div className="mx-[40px] py-[24px] flex items-center justify-between">
                    <p className="text-white text-[18px] leading-[24px]">Would you like to add a Consideration, Tech Note, Case Study ect. to the system?</p>

                    <div className="bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium min-w-fit">
                        Propose to editor
                    </div>
                </div>

            </div>

        </UserLayout>
    )

}