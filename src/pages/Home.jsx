import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { OnboardAPI } from "../api/onboarding";
import { ToastContainer, toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import UserLayout from "../layouts/User";
import { SinglePostState } from "../states";
import { useRecoilState } from "recoil";

export default function HomePage() {

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

            <div className="w-full grid grid-cols-2">

            </div>

        </UserLayout>
    )

}