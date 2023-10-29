import { Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function UserLayout({ children, pageTitle, tagData, setTagData, hideSidebar = false, fullWidth = false }) {

    const navigate = useNavigate()
    const location = useLocation();

    function isCurrentPath(path) {
        return location.pathname === path;
    }


    const auth = useAuthUser();
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <main className={`min-h-screen flex flex-col items-stretch justify-stretch`}>
            <Helmet>
                <title>DSS | {pageTitle}</title>
            </Helmet>

            <Header />

            <section className={clsx(!fullWidth && 'max-w-7xl py-5' ,'mx-auto w-full min-h-full flex flex-auto flex-col')}>
                {
                    hideSidebar ?
                        <div className="w-full flex flex-auto min-h-full flex-col shrink">
                            {children}
                        </div> :
                        <div className="grid md:grid-cols-5 gap-5 w-full h-full grow">
                            <div className={`min-h-full col-span-2`}>
                                <Sidebar tagData={tagData} setTagData={setTagData} />
                            </div>
                            <div className="min-h-full col-span-3">
                                {children}
                            </div>
                        </div>
                }
            </section>
        </main>
    )

}