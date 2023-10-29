import { Disclosure, Transition } from '@headlessui/react';
import parse from 'html-react-parser';
import { BsChevronRight } from 'react-icons/bs';
import LinkComponent from './LinkComponent';
import { useEffect, useState } from 'react';
import HeadingComponent from './HeadingComponent';
import ImageComponent from './ImageComponent';
import { PiWarningFill } from "react-icons/pi";
import ParagraphComponent from './ParagraphComponent';

export default function TableComponent(props) {
    const { block } = props;

    return (
        <div key={block.id} className="w-full shadow-sm not-prose relative bg-slate-50 border rounded-xl overflow-hidden dark:bg-slate-800/25 mb-3">
            <table className="border-collapse shadow-sm table-auto w-full text-sm">
                <thead>
                    <tr>
                        {block.data.content[0].map((item) => {
                            return <th key={item} className='border-b dark:border-slate-600 font-semibold p-4 pl-8 py-5 text-slate-400 dark:text-slate-200 text-left'>{parse(item)}</th>
                        })}
                    </tr>
                </thead>
                <tbody className='bg-white dark:bg-slate-800'>
                    {block.data.content.slice(1).map((row) => {
                        return <tr key={row[0]}>
                            {row.map((item) => {
                                return <td key={item} className='border-b border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400'>{parse(item)}</td>
                            })}
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    );
}