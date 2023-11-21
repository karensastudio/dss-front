import { Fragment, useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { getDecisionsApi } from "../api/decision";
import parse from 'html-react-parser';
import { CgSpinner } from 'react-icons/cg';
import ToggleComponent from "../components/editor/ToggleComponent";
import LinkComponent from "../components/editor/LinkComponent";
import ImageComponent from "../components/editor/ImageComponent";
import HeadingComponentV2 from "../components/editor/HeadingComponentV2";
import ParagraphComponent from "../components/editor/ParagraphComponent";

export default function DecisionPdfPage() {
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const authHeader = useAuthHeader();

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const response = await getDecisionsApi(authHeader());
                if (response.status === 'success') {
                    setDecisions(response.response.posts);
                } else {
                    setDecisions([]);
                }
            } catch (error) {
                console.error(error);
                setDecisions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDecisions();

        window.onafterprint = () => {
            navigate('/');
        };

        return () => {
            window.onafterprint = null;
        };
    }, []);

    useEffect(() => {
        if (decisions.length > 0) {
            const details = document.querySelectorAll('details');
            details.forEach((targetDetail) => {
                targetDetail.setAttribute('open', '');
            });
            window.print();
        }

    }, [decisions]);

    return (
        <div className="bg-white aspect-1/1.4 max-w-5xl mx-auto border-black border-[2px] rounded-lg">
            <div className="mx-3 mt-3 rounded-xl print:bg-black print:bg-opacity-25 bg-black bg-opacity-25 px-5 py-3 flex items-center justify-between">
                <h1 className="text-black text-2xl font-black tracking-widest">DSS</h1>

                <p className="text-black">Decision Report</p>
            </div>
            <div className="flex flex-col divide-black divide-y-4 divide-dotted">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <CgSpinner className="text-[20px] animate-spin" />
                    </div>
                ) : (
                    decisions.map((decision, index) => (
                        <div key={decision.id} className={`p-5 decision-item`}>
                            <span className="title-text text-[18px] font-[600] text-[#111315]">
                                {decision.title}
                            </span>
                            <div className="pt-2 pb-5">
                                <div className="flex items-center justify-start space-x-[8px]">
                                    {decision?.tags?.map((tag) => (
                                        <span key={tag.id} className='px-[12px] py-[2px] text-[12px] leading-[20px] rounded-full border-[1px] border-[#111315] text-black'>#{tag.name}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-[16px] leading-[24px] text-[#111315]">
                                {
                                    JSON.parse(decision.description)?.blocks.map((block) => {
                                        if (block.type == "paragraph")
                                            return <ParagraphComponent block={block} />;
                                        if (block.type == "header")
                                            return <div key={block.id} className="mb-3">
                                                <HeadingComponentV2 element={block} />
                                            </div>;
                                        if (block.type == "Image")
                                            return <ImageComponent element={block} />;
                                        if (block.type == "raw")
                                            return <div key={block.id} className="w-full rounded-[12px] mb-3" dangerouslySetInnerHTML={{ __html: block.data.html }}></div>;
                                        if (block.type == "linkTool") {
                                            return <LinkComponent block={block} />;
                                        }
                                        if (block.type == "warning")
                                            return <div key={block.id} className="w-full rounded-[12px] bg-gray-500 bg-opacity-10 text-gray-700 dark:text-white p-4 mb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <div>
                                                            <span className="text-[16px] leading-[20px] font-semibold">
                                                                {block.data.title}
                                                            </span>
                                                            <p className="text-[14px]">
                                                                {block.data.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>;
                                        if (block.type == "list")
                                            return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                <ul className="list-disc list-inside">
                                                    {block.data.items.map((item) => {
                                                        return <li key={item}>{item}</li>
                                                    })}
                                                </ul>
                                            </div>;
                                        if (block.type == "table")
                                            return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            {block.data.content[0].map((item) => {
                                                                return <th key={item}>{parse(item)}</th>
                                                            })}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {block.data.content.slice(1).map((row) => {
                                                            return <tr key={row[0]}>
                                                                {row.map((item) => {
                                                                    return <td key={item}>{parse(item)}</td>
                                                                })}
                                                            </tr>
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>;
                                        if (block.type == "toggle") {
                                            return <ToggleComponent
                                                block={block}
                                            />;
                                        }
                                    })
                                }
                                {/* {decision?.description && parse(decision?.description)} */}
                            </div>
                            {decision.notes && decision.notes.length > 0 && (
                                <div className="text-[16px] leading-[24px] text-[#111315]">
                                    {decision.notes.map((note, index) => (
                                        <Fragment key={index}>
                                            <span>{note.message}</span>
                                            {index !== decision.notes.length - 1 && <br />}
                                        </Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
