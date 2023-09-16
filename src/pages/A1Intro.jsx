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

export default function A1IntroPage() {

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

                <div className="mx-[40px] py-[16px] px-[16px] font-light text-white text-[14px] leading-[24px]">
                    <p className="mb-[12px]">
                        From an initial understanding of the implications of the scale of the project, contextual factors will also have an immediate impact on the determination of the co-creation pathway. A possible starting point is observing the level and current methods of participation in your area, organisation or institution. If there is a level of collaborative culture in the methods of governance, then this implies a starting point for change that is more favourable and will allow the project to be able to advance at a quicker pace, if there is not, time will be needed to build from the ground up.
                    </p>
                    <p className="mb-[12px]">
                        There are different organisational cultures in both private and public organisations. It is possible to map the level of participatory planning and community-led development by collecting, recording, analysing and synthesising the information needed to describe the cultural resources, networks, links and patterns of usage of a given community or group (Stewart, 2007). There are different methodologies to document the pathways of citizen engagement that have traditionally been available (see Ferreira, 2022; Nunes et al., 2019). The main steps to follow are:
                    </p>

                    <ol className="list-decimal">
                        <li>Identifying participatory practices in the public sphere in general and in municipal policies and activities.</li>
                        <li>Identifying networks of local organisations, champions, residents or neighbourhood associations and business actors or companies. </li>
                        <li>Analysing previous participatory projects led by the municipality and initiatives led by citizens.</li>
                        <li>Interviewing citizens, organisations, informal groups, initiatives and municipal actors</li>
                    </ol>
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