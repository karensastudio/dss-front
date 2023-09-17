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

export default function A1Case() {

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
                    <p className="text-white text-[14px] leading-[20px] text-opacity-60">Section A | Consideration A1 | Case study A1</p>

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
                    <h1 className="text-white text-[24px] leading-[32px]">Case study A1:</h1>
                </div>

                <div className="mx-[40px] py-[24px]">
                    <div className="flex items-center justify-start space-x-[8px]">
                        <span className="px-[12px] py-[2px] text-[12px] leading-[20px] text-white rounded-full border-[1px] border-white">#section_a</span>
                        <span className="px-[12px] py-[2px] text-[12px] leading-[20px] text-white rounded-full border-[1px] border-white">#consideration</span>
                    </div>
                </div>

                <div className="mx-[40px] py-[16px] font-light text-white text-[14px] leading-[24px]">
                    <img src="https://source.unsplash.com/random/486x528?sig=7" className="w-full aspect-video rounded-[12px] mb-[12px] object-cover" />
                    <p className="mb-[12px]">
                        Charlotte Quarter has a successful history of co-creating nature based solutions. Prior to engaging the community and co-creating many different nature based solutions, the quarter had significant problems with high crime rates, insecurity among inhabitants and was on the national “ghetto list” with demands of regeneration. This neighbourhood has 1800 inhabitants from 40 different countries of origin. To build the participatory culture, the citizens in the community were supported by a strong team of facilitators. Over several years of facilitation the inner resources of the community were encouraged, developed and applied in the co-creation of a healthy environment full of nature based solutions that citizens today are particularly proud of. There is a book that illustrates this very well (although in Danish it includes wonderful pictures from activities and regenerated areas). The book can be found here: <u>http://charlottekvarteret.dk/wp-content/uploads/2013/09/98120_0_LO_NP.pdf </u>. I would urge you as the reader of this to flick through the pictures and take a closer look at the many "champions" of the participatory culture that are profiled in the book.
                    </p>
                    <p className="mb-[12px]">
                        The participatory culture has been successfully developed by engaging common interests of young and old generations across the different cultures and languages while allowing specific citizen groups to co-create what they found valuable to them. For some this was a playground, for others it was a community vegetable garden and for others again it was a place to meet and have events or barbecues.
                    </p>
                    <p className="mb-[12px]">
                        One of the things the facilitators managed well in the Charlotte Quarter was to create an overarching linkage and a transparent communication on all the NBS activities in the neighbourhood so that everybody visiting the area could experience both individual elements but also the community healthy corridor spirit as a whole. Towards the end of the book the method used in Charlotte Quarter is described and includes many of the elements also being used in other European NB co-creation projects.
                    </p>
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