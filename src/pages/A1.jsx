import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { OnboardAPI } from "../api/onboarding";
import { ToastContainer, toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import UserLayout from "../layouts/User";

export default function A1Page() {

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
                <div className="mx-[40px] py-[24px] border-b-[1px] border-b-white mb-[68px]">
                    <p className="text-white text-[14px] leading-[20px] text-opacity-60">Section A | Consideration A1</p>
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
                            <p className="text-white text-[18px] leading-[24px]">A1.1 High participatory culture.</p>
                        </div>

                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#0071FF] w-full">
                            <p className="text-white text-[18px] leading-[24px]">A1.2 Avarage/medium participatory culture. </p>
                        </div>

                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#0071FF] w-full">
                            <p className="text-white text-[18px] leading-[24px]">A1.3 Low participatory culture.</p>
                        </div>
                    </div>
                </div>

                <div className="mx-[40px] py-[16px]">

                    <h2 className="text-[18px] text-white leading-[24px] mb-[16px]">Ressources:</h2>

                    <div className="flex flex-col items-center justify-center">
                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#41474D] w-full">
                            <p className="text-white text-[18px] leading-[24px]">Narrative Text A1: Culture of participation</p>
                        </div>

                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#41474D] w-full">
                            <p className="text-white text-[18px] leading-[24px]">Tech Note A1: Culture of participation</p>
                        </div>

                        <div className="my-[8px] px-[25px] py-[16px] rounded-[12px] bg-[#41474D] w-full">
                            <p className="text-white text-[18px] leading-[24px]">Case Study A1:</p>
                        </div>
                    </div>
                </div>

            </div>

        </UserLayout>
    )

}