import { Disclosure, Transition } from '@headlessui/react';
import parse from 'html-react-parser';
import { BsChevronRight } from 'react-icons/bs';
import LinkComponent from './LinkComponent';
import { useEffect, useState } from 'react';
import HeadingComponent from './headingComponent';
import ImageComponent from './ImageComponent';
import { PiWarningFill } from "react-icons/pi";
import ParagraphComponent from './ParagraphComponent';

export default function ToggleComponent(props) {
    const { block, setSinglePostDataJSON, singlePostDataJSON } = props;

    const [toggleChilds, setToggleChilds] = useState(false);

    useEffect(() => {
        setToggleChilds(singlePostDataJSON?.blocks.slice(singlePostDataJSON.blocks.indexOf(block) + 1, singlePostDataJSON.blocks.indexOf(block) + 1 + block.data.items));
        // remove toggleChilds from singlePostDataJSON by block index
        setSinglePostDataJSON({
            ...singlePostDataJSON,
            blocks: singlePostDataJSON.blocks.filter((item) => {
                return !singlePostDataJSON?.blocks.slice(singlePostDataJSON.blocks.indexOf(block) + 1, singlePostDataJSON.blocks.indexOf(block) + 1 + block.data.items).includes(item);
            })
        });
    }, [])

    return (<Disclosure>
        {({ open }) => (
            /* Use the `open` state to conditionally change the direction of an icon. */
            <div className="border border-white border-opacity-25 rounded-[12px] mb-3">
                <Disclosure.Button className="flex items-center justify-between text-black dark:text-white bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 text-start px-3 py-5 rounded-[12px] w-full">
                    {parse(block.data.text)}

                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white dark:text-gray-200">
                        <BsChevronRight className={`text-[16px] ${open ? 'rotate-90' : 'rotate-0'}`} />
                    </div>
                </Disclosure.Button>
                <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                >
                    <Disclosure.Panel className="text-black dark:text-white text-opacity-70 px-3 py-5">
                        {/* parse next blocks by block.data.items count as child of this block */}

                        {toggleChilds && toggleChilds.map((subBlock) => {
                            if (subBlock.type == "paragraph")
                                return <ParagraphComponent block={subBlock} />;
                            if (subBlock.type == "header")
                                return <HeadingComponent attributes={subBlock.attributes} element={subBlock} children={subBlock.children} />;
                            if (subBlock.type == "Image")
                                return <ImageComponent element={subBlock} />;
                            if (subBlock.type == "raw")
                                return <div key={subBlock.id} className="w-full rounded-[12px] mb-3" dangerouslySetInnerHTML={{ __html: subBlock.data.html }}></div>;
                            if (subBlock.type == "list")
                                return <div key={subBlock.id} className="w-full rounded-[12px] mb-3">
                                    <ul className="list-disc list-inside">
                                        {subBlock.data.items.map((item) => {
                                            return <li key={item}>{item}</li>
                                        })}
                                    </ul>
                                </div>;
                            if (subBlock.type == "warning")
                                return <div key={subBlock.id} className="w-full rounded-[12px] bg-orange-500 bg-opacity-10 text-orange-500 p-4 mb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white dark:text-orange-200">
                                                <PiWarningFill className="text-[16px]" />
                                            </div>
                                            <div>
                                                <span className="text-[16px] leading-[20px] font-semibold">
                                                    {subBlock.data.title}
                                                </span>
                                                <p className="text-[14px]">
                                                    {subBlock.data.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>;
                            if (subBlock.type == "linkTool") {
                                return <LinkComponent block={subBlock} />;
                            }
                            if (subBlock.type == "list")
                                return <div key={subBlock.id} className="w-full rounded-[12px] mb-3">
                                    <ul className="list-disc list-inside">
                                        {subBlock.data.items.map((item) => {
                                            return <li key={item}>{item}</li>
                                        })}
                                    </ul>
                                </div>;
                            if (subBlock.type == "quote")
                                return <div key={subBlock.id} className="w-full rounded-[12px] mb-3">
                                    <blockquote className="text-[14px] text-opacity-60">
                                        {subBlock.data.text}
                                    </blockquote>
                                </div>;
                            if (subBlock.type == "table")
                                return <div key={subBlock.id} className="w-full rounded-[12px] mb-3">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                {subBlock.data.content[0].map((item) => {
                                                    return <th key={item}>{item}</th>
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subBlock.data.content.slice(1).map((row) => {
                                                return <tr key={row[0]}>
                                                    {row.map((item) => {
                                                        return <td key={item}>{item}</td>
                                                    })}
                                                </tr>
                                            })}
                                        </tbody>
                                    </table>
                                </div>;
                            if (subBlock.type == "code")
                                return <div key={subBlock.id} className="w-full rounded-[12px] mb-3">
                                    <pre className="bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded-[12px] p-4">
                                        <code className="text-[14px] text-opacity-60">
                                            {subBlock.data.code}
                                        </code>
                                    </pre>
                                </div>;
                        })}
                    </Disclosure.Panel>
                </Transition>
            </div>
        )}
    </Disclosure>)
}