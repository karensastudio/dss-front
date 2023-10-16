import { Link, useNavigate } from "react-router-dom"
import { useAuthHeader, useIsAuthenticated, useSignOut } from "react-auth-kit";
import { logoutAPI } from "../api/auth";
import { HasAccess } from "@permify/react-role";
import ToggleThemeSwitch from "./ToggleThemeSwitch";
import { useTheme } from "../context/ThemeContext";
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { HiOutlineLogout } from "react-icons/hi";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Header() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated()
    const authHeader = useAuthHeader();
    const signOut = useSignOut();

    const handleLogout = async () => {

        const response = await logoutAPI(authHeader());

        if (response.status === 'success') {
            signOut();
            navigate('/login');
        } else {
            signOut();
            console.error('Logout failed:', response.message);
        }
    };

    return (
        <Disclosure as="nav" className="bg-white shadow">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl">
                        <div className="flex h-16 justify-between">
                            <div className="flex px-2 lg:px-0">
                                <div className="flex flex-shrink-0 items-center">
                                    <h1 className={`font-extrabold text-xl text-black dark:text-white`}>DSS</h1>
                                </div>
                                <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                                    {/* Current: "border-blue-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                    <a
                                        href="#"
                                        className="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900"
                                    >
                                        Home
                                    </a>
                                    <a
                                        href="#"
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        Graph
                                    </a>
                                    <a
                                        href="#"
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        Bookmarks
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 gap-3 lg:justify-end">
                                <div className="w-full max-w-lg lg:max-w-xs">
                                    <label htmlFor="search" className="sr-only">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            id="search"
                                            name="search"
                                            className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            placeholder="Search"
                                            type="search"
                                        />
                                    </div>
                                </div>

                                {
                                    isAuthenticated() ?
                                        <>
                                            <button
                                                type="button"
                                                className="relative inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            >
                                                {/* <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" /> */}
                                                Generate Report
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-500"
                                            >
                                                <HiOutlineLogout className="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </> :
                                        <>
                                            <span className="isolate inline-flex rounded-md shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/register')}
                                                    className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                                                    >
                                                    Register
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/login')}
                                                    className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                                                >
                                                    Login
                                                </button>
                                            </span>

                                        </>
                                }
                            </div>
                            <div className="flex items-center lg:hidden">
                                {/* Mobile menu button */}
                                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="lg:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {/* Current: "bg-blue-50 border-blue-500 text-blue-700", Default: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" */}
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-blue-500 bg-blue-50 py-2 pl-3 pr-4 text-base font-medium text-blue-700"
                            >
                                Home
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                            >
                                Graph
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                            >
                                Bookmarks
                            </Disclosure.Button>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );

}