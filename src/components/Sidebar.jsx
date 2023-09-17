import { Disclosure, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { BsSearch, BsChevronUp, BsBookmarkFill } from "react-icons/bs";
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';

import data from './miserables.json';

export function SearchSection() {
    return (
        <div className="flex flex-col space-y-[16px]">

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

            <div className="flex flex-col space-y-[16px]">
                <a className="text-[#0071FF] text-[16px] leading-[24px]">A1. Consider the participatory culture in the project territory.</a>

                <a className="text-white text-[16px] leading-[24px]">A1.3. Low participatory culture.</a>

                <a className="text-white text-[16px] leading-[24px]">B1.3. Stakeholder </a>

                <a className="text-white text-[16px] leading-[24px]">Tech Note E3</a>
            </div>

        </div>
    )
}

export function ListOfContentSection() {
    return (
        <div className="flex flex-col space-y-[16px] mt-[10px]">

            <Disclosure>
                {({ open = true }) => (
                    <section className="bg-[#41474D] px-[25px] py-[16px] rounded-[12px]">
                        <Disclosure.Button className="flex w-full justify-between items-center text-left text-[16px] font-medium text-white">
                            <span>A: Evaluating Context & Determining Approach</span>
                            <div className="bg-[#0071FF] rounded-full p-[14px]">
                                <BsChevronUp
                                    className={`${open ? 'rotate-180 transform' : 'rotate-90'
                                        } text-[16px] text-white`}
                                />
                            </div>
                        </Disclosure.Button>
                        <Transition
                            show={open}
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                        >
                            <Disclosure.Panel className="px-[27px] mt-[10px]">
                                <div className="flex flex-col space-y-[16px]">
                                    <a className="text-[#0071FF] text-[16px] leading-[24px]">A1. Consider the participatory culture in the project territory.</a>

                                    <a className="text-white text-[16px] leading-[24px]">A1.3. Low participatory culture.</a>

                                    <a className="text-white text-[16px] leading-[24px]">B1.3. Stakeholder </a>

                                    <a className="text-white text-[16px] leading-[24px]">Tech Note E3</a>
                                </div>
                            </Disclosure.Panel>
                        </Transition>
                    </section>
                )}
            </Disclosure>

            <Disclosure>
                {({ open }) => (
                    <section className="bg-[#41474D] px-[25px] py-[16px] rounded-[12px]">
                        <Disclosure.Button className="flex w-full justify-between items-center text-left text-[16px] font-medium text-white">
                            <span>B: Involving Stakeholders</span>
                            <div className="bg-[#0071FF] rounded-full p-[14px]">
                                <BsChevronUp
                                    className={`${open ? 'rotate-180 transform' : 'rotate-90'
                                        } text-[16px] text-white`}
                                />
                            </div>
                        </Disclosure.Button>
                        <Transition
                            show={open}
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                        >
                            <Disclosure.Panel className="px-[27px] mt-[10px]">
                                <div className="flex flex-col space-y-[16px]">
                                    <a className="text-[#0071FF] text-[16px] leading-[24px]">A1. Consider the participatory culture in the project territory.</a>

                                    <a className="text-white text-[16px] leading-[24px]">A1.3. Low participatory culture.</a>

                                    <a className="text-white text-[16px] leading-[24px]">B1.3. Stakeholder </a>

                                    <a className="text-white text-[16px] leading-[24px]">Tech Note E3</a>
                                </div>
                            </Disclosure.Panel>
                        </Transition>
                    </section>
                )}
            </Disclosure>


        </div>
    )
}

export function BookmarkSection() {
    return (
        <div className="flex flex-col space-y-[8px] mt-[10px]">

            <a className="text-[#0071FF] text-[16px] leading-[24px] flex items-center py-[10px]">
                <BsBookmarkFill className="mr-[10px]" />
                <span>A1. Consider the participatory culture in the project territory.</span>
            </a>

            <a className="text-white text-[16px] leading-[24px] flex items-center py-[10px]">
                <BsBookmarkFill className="mr-[10px]" />
                <span>A1.3. Low participatory culture.</span>
            </a>

            <a className="text-white text-[16px] leading-[24px] flex items-center py-[10px]">
                <BsBookmarkFill className="mr-[10px]" />
                <span>B1.3. Stakeholder</span>
            </a>

            <a className="text-white text-[16px] leading-[24px] flex items-center py-[10px]">
                <BsBookmarkFill className="mr-[10px]" />
                <span>Tech Note E3</span>
            </a>

        </div>
    )
}

export function DecisionReportSection() {
    return (
        <div className="flex flex-col mt-[10px]">
            <div className="flex flex-col space-y-[16px] mb-[48px]">
                <a className="text-[#0071FF] text-[16px] leading-[24px] flex items-center">
                    <span>A1. Consider the participatory culture in the project territory.</span>
                </a>

                <a className="text-white text-[16px] leading-[24px] flex items-center">
                    <span>A1.3. Low participatory culture.</span>
                </a>

                <a className="text-white text-[16px] leading-[24px] flex items-center">
                    <span>B1.3. Stakeholder</span>
                </a>

                <a className="text-white text-[16px] leading-[24px] flex items-center">
                    <span>Tech Note E3</span>
                </a>
            </div>

            <a className="flex w-fit bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium">
                Generate Decision Report
            </a>
        </div>
    )
}

export function GraphSection() {
    return (
        <ForceGraph2D
            graphData={data}
            nodeColor='#000000'
            backgroundColor="#ffffff"
            width={document.getElementById('sidebar-content').offsetWidth - 80}
            height={document.getElementById('sidebar-content').parentElement.offsetHeight - 300}
            nodeLabel="id"
            onNodeClick={(node) => {
                window.location.href = '/' + node.slug;
            }}
            nodeThreeObject={node => {
                const nodeEl = document.createElement('a');
                nodeEl.textContent = node.id;
                nodeEl.style.color = '#000000';
                nodeEl.className = 'node-label';
                nodeEl.innerText = node.id;
                return new CSS2DObject(nodeEl);
            }}
            nodeThreeObjectExtend={true}
        />
    );
}


export default function Sidebar() {
    const [activePage, setActivePage] = useState("dashboard");

    return (
        <aside className="px-[40px] py-[32px] min-h-full" id="sidebar-content">
            <div className="py-[24px] flex items-center justify-start space-x-[18px] text-[14px] font-normal">
                <div onClick={() => setActivePage('search')} className={`cursor-pointer text-white py-[12px]  ${activePage == 'search' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    <BsSearch className="text-[18px]" />
                </div>

                <div onClick={() => setActivePage('dashboard')} className={`cursor-pointer text-white py-[12px] ${activePage == 'dashboard' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    List of Content
                </div>

                <div onClick={() => setActivePage('bookmark')} className={`cursor-pointer text-white py-[12px] ${activePage == 'bookmark' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    Your Bookmarks
                </div>

                <div onClick={() => setActivePage('decision-graph')} className={`cursor-pointer text-white py-[12px] ${activePage == 'decision-graph' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    Your Decision Graph
                </div>

                <div onClick={() => setActivePage('decision-report')} className={`cursor-pointer text-white py-[12px] ${activePage == 'decision-report' ? 'border-b-2 border-b-white' : 'text-opacity-60'} `}>
                    Your Decision Report
                </div>

            </div>

            {
                activePage == 'search' ? <SearchSection /> : null
            }

            {
                activePage == 'dashboard' ? <ListOfContentSection /> : null
            }

            {
                activePage == 'bookmark' ? <BookmarkSection /> : null
            }

            {
                activePage == 'decision-report' ? <DecisionReportSection /> : null
            }

            {
                activePage == 'decision-graph' ? <GraphSection /> : null
            }

        </aside>
    )

}