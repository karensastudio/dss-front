import { Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function UserLayout({ children, pageTitle, tagData, setTagData }) {

    const navigate = useNavigate()
    const location = useLocation();

    function isCurrentPath(path) {
        return location.pathname === path;
    }


    const auth = useAuthUser();
    const { isLightMode } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <main className={`min-h-screen flex flex-col items-stretch justify-stretch`}>
            <Helmet>
                <title>DSS | {pageTitle}</title>
            </Helmet>

            <Header />

            <section className={`h-full grow flex flex-col ${isLightMode ? 'bg-white' : 'bg-[#111315]'}`}>
                <div className="grid grid-cols-2 w-full h-full grow">
                    <div className={`min-h-full col-span-1 ${isLightMode ? 'bg-[#d9e6f1]' : 'bg-[#202427]'}`}>
                        <Sidebar tagData={tagData} setTagData={setTagData} />
                    </div>
                    <div className="min-h-full col-span-1">
                        {children}
                    </div>
                </div>
            </section>
        </main>
    )

}