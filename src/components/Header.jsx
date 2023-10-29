import { Link, useNavigate } from "react-router-dom"
import { useAuthHeader, useIsAuthenticated, useSignOut } from "react-auth-kit";
import { logoutAPI } from "../api/auth";
import { HasAccess } from "@permify/react-role";
import ToggleThemeSwitch from "./ToggleThemeSwitch";
import { useTheme } from "../context/ThemeContext";
import { Disclosure, Menu, Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, DocumentTextIcon, MagnifyingGlassIcon, TagIcon } from '@heroicons/react/20/solid'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { HiOutlineLogout } from "react-icons/hi";
import clsx from "clsx";
import { Fragment } from "react";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const solutions = [
    {
        name: 'Posts',
        description: 'Create and manage your posts',
        href: '/posts',
        icon: DocumentTextIcon,
    },
    {
        name: 'Tags',
        description: 'Create and manage your tags',
        href: '/tags',
        icon: TagIcon,
    },
]


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

    // check current page
    const currentPath = window.location.pathname;

    return (
        <Disclosure as="nav" className="bg-white shadow">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl">
                        <div className="flex h-16 justify-between">
                            <div className="flex px-2 lg:px-0">
                                <Link className="flex flex-shrink-0 items-center" to={'/'}>
                                    <h1 className={`font-extrabold text-xl text-black dark:text-white`}>DSS</h1>
                                </Link>
                                <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                                    {/* Current: "border-blue-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                    <Link
                                        to="/"
                                        className={clsx(
                                            "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium",
                                            currentPath === "/" && "border-b-blue-500 text-gray-900",
                                            currentPath != "/" && "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                        )}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/graph"
                                        className={clsx(
                                            "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium",
                                            currentPath === "/graph" && "border-b-blue-500 text-gray-900",
                                            currentPath != "/graph" && "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                        )}
                                    >
                                        Graph
                                    </Link>
                                    <Link
                                        to="/bookmarks"
                                        className={clsx(
                                            "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium",
                                            currentPath === "/bookmarks" && "border-b-blue-500 text-gray-900",
                                            currentPath != "/bookmarks" && "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                        )}
                                    >
                                        Bookmarks
                                    </Link>
                                    <Popover className="relative">
                                        {({ open }) => (
                                            <>
                                                <Popover.Button
                                                    className={clsx(
                                                        "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium",
                                                        "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                                    )}
                                                >
                                                    <span className="py-5">Admin Panel</span>
                                                    <ChevronDownIcon
                                                        className={`${open ? 'text-blue-300' : 'text-blue-300/70'}
                  ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-blue-300/80`}
                                                        aria-hidden="true"
                                                    />
                                                </Popover.Button>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-200"
                                                    enterFrom="opacity-0 translate-y-1"
                                                    enterTo="opacity-100 translate-y-0"
                                                    leave="transition ease-in duration-150"
                                                    leaveFrom="opacity-100 translate-y-0"
                                                    leaveTo="opacity-0 translate-y-1"
                                                >
                                                    <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0">
                                                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                                                            <div className="relative flex flex-col gap-8 bg-white p-7">
                                                                {solutions.map((item) => (
                                                                    <a
                                                                        key={item.name}
                                                                        href={item.href}
                                                                        className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/50"
                                                                    >
                                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-blue-600 text-opacity-50 sm:h-12 sm:w-12">
                                                                            <item.icon aria-hidden="true" />
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <p className="text-sm font-medium text-gray-900">
                                                                                {item.name}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">
                                                                                {item.description}
                                                                            </p>
                                                                        </div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Popover.Panel>
                                                </Transition>
                                            </>
                                        )}
                                    </Popover>

                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 gap-3 lg:justify-end">
                                <div className="w-full max-w-lg lg:max-w-xs">
                                    <label htmlFor="search" className="sr-only">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <div
                                            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                                            onClick={
                                                () => {
                                                    navigate({
                                                        pathname: '/search',
                                                        search: `?query=${document.getElementById('search-input').value}`,
                                                    });
                                                }
                                            }
                                        >
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            id="search-input"
                                            name="search"
                                            className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            placeholder="Search"
                                            type="search"
                                            onKeyDown={(e) => {
                                                console.log(document.getElementById('search-input').value);
                                                if (e.key === 'Enter') {
                                                    navigate({
                                                        pathname: '/search',
                                                        search: `?query=${document.getElementById('search-input').value}`,
                                                    });
                                                }
                                            }}
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
                            <Link
                                to="/"
                                className={clsx(
                                    "block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium",
                                    currentPath === "/" && "bg-blue-50 border-l-blue-500 text-blue-700",
                                    currentPath != "/" && "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                                )}
                            >
                                Home
                            </Link>
                            <Link
                                to="/graph"
                                className={clsx(
                                    "block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium",
                                    currentPath === "/graph" && "bg-blue-50 border-l-blue-500 text-blue-700",
                                    currentPath != "/graph" && "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                                )}
                            >
                                Graph
                            </Link>
                            <Link
                                to="/bookmarks"
                                className={clsx(
                                    "block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium",
                                    currentPath === "/bookmarks" && "bg-blue-50 border-l-blue-500 text-blue-700",
                                    currentPath != "/bookmarks" && "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                                )}
                            >
                                Bookmarks
                            </Link>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );

}