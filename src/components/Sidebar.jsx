import { useState } from "react";
import { BsSearch } from "react-icons/bs";

export function SearchSection() {
    return (
        <div className="flex flex-col">

            <div className="flex py-[32px] items-center justify-between space-x-[16px]">
                <input
                    type="search"
                    placeholder="Search for content"
                    className="w-full bg-transparent rounded-none focus-within:outline-none text-white py-[15px] text-[20px] border-b-2 border-b-white border-opacity-25 focus:border-opacity-100 leading-[32px] font-medium"
                />

                <button type="button" className="ml-auto flex bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium">
                    Search
                </button>
            </div>

        </div>
    )
}

export default function Sidebar() {
    const [activePage, setActivePage] = useState("search");

    return (
        <aside className="px-[40px] py-[32px]">
            <div className="py-[12px] flex items-center justify-start space-x-[24px]">
                <a className={`text-white py-[12px]  ${activePage == 'search' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    <BsSearch className="text-[18px]" />
                </a>

                <a className={`text-white py-[12px] ${activePage == 'dashboard' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    List of Content
                </a>

            </div>

            {
                activePage == 'search' ? <SearchSection /> : null
            }

        </aside>
    )

}