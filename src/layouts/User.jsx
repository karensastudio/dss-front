import { Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function UserLayout({ children, pageTitle }) {

    const navigate = useNavigate()
    const location = useLocation();

    function isCurrentPath(path) {
        return location.pathname === path;
    }


    const auth = useAuthUser();

    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <main className="min-h-screen flex flex-col items-stretch justify-stretch">
            <Helmet>
                <title>DSS | {pageTitle}</title>
            </Helmet>

            <Header />

            <section className="bg-[#111315] h-full grow flex flex-col">
                <div className="grid grid-cols-2 w-full h-full grow">
                    <div className="min-h-full col-span-1 bg-[#202427]">
                        <Sidebar />
                    </div>
                    <div className="min-h-full col-span-1">
                        {children}
                    </div>
                </div>
            </section>
        </main>
    )

}