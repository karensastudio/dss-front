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
import TableComponent from "../components/editor/TableComponent";
import { sectionDecisionStorage } from "../utils/sectionDecisionStorage";

export default function DecisionPdfPage() {
    const [decisions, setDecisions] = useState([]);
    const [sectionDecisions, setSectionDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const authHeader = useAuthHeader();

    console.log(decisions);

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const response = await getDecisionsApi(authHeader());
                if (response.status === 'success') {
                    setDecisions(response.response.posts);
                } else {
                    setDecisions([]);
                }
                
                // Get section decisions
                const { sections } = sectionDecisionStorage.getAll();
                setSectionDecisions(sections);
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
        if ((decisions.length > 0 || sectionDecisions.length > 0) && !loading) {
            const details = document.querySelectorAll('details');
            details.forEach((targetDetail) => {
                targetDetail.setAttribute('open', '');
            });
            window.print();
        }
    }, [decisions, sectionDecisions, loading]);
    
    // Helper function to extract section content
    const extractSectionContent = (blocks, sectionFk) => {
        if (!blocks || !Array.isArray(blocks)) return null;
        
        return blocks.find(block => block.id === sectionFk);
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">DSS Decision Report</h1>
            
            {loading ? (
                <div className="flex justify-center">
                    <CgSpinner className="animate-spin text-4xl" />
                </div>
            ) : (
                <div>
                    {/* Full Posts Section */}
                    {decisions.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Full Posts</h2>
                            {decisions.map((decision) => (
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
                                        {decision?.description && JSON.parse(decision?.description).blocks.map((block) => {
                                            if (block.type == "paragraph")
                                                return <ParagraphComponent block={block} />;
                                            if (block.type == "header")
                                                return <HeadingComponentV2 block={block} />;
                                            if (block.type == "Image")
                                                return <ImageComponent element={block} />;
                                            if (block.type == "raw")
                                                return <div key={block.id} className="w-full rounded-[12px] mb-3" dangerouslySetInnerHTML={{ __html: block.data.html }}></div>;
                                            if (block.type == "list")
                                                return <div key={block.id} className="w-full rounded-[12px] mb-3">
                                                    <ul className="list-disc list-inside">
                                                        {block.data.items.map((item) => {
                                                            return <li key={item}>{parse(item)}</li>
                                                        })}
                                                    </ul>
                                                </div>;
                                            if (block.type == "warning")
                                                return <div key={block.id} className="w-full rounded-[12px] bg-orange-500 bg-opacity-10 text-orange-500 p-4 mb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white dark:text-orange-200">
                                                            </div>
                                                            <div>
                                                                <span className="text-[16px] leading-[20px] font-semibold">
                                                                    {block.data.title}
                                                                </span>
                                                                <p className="text-[14px]">
                                                                    {parse(block.data.message)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>;
                                            if (block.type == "linkTool") {
                                                return <LinkComponent block={block} />;
                                            }
                                            if (block.type == "table")
                                                return <TableComponent block={block} />;
                                            if (block.type == "toggle") {
                                                return <ToggleComponent
                                                    block={block}
                                                    postId={decision.id}
                                                    postData={{ 
                                                        title: decision.title,
                                                        slug: decision.slug
                                                    }}
                                                />;
                                            }
                                        })}
                                    </div>
                                    {decision.notes && decision.notes.length > 0 && (
                                        <div className="border rounded p-3 text-[16px] leading-[24px] text-[#111315]">
                                            <h3 className="font-bold py-2">Notes:</h3>
                                            <div className="flex flex-col divide-y ">
                                            {decision.notes.map((note, index) => (
                                                <div key={index} className="py-2">
                                                    <span>{note.note}</span>
                                                    {index !== decision.notes.length - 1 && <br />}
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Sections Section */}
                    {sectionDecisions.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Section Decisions</h2>
                            {sectionDecisions.map((section) => (
                                <div key={section.id} className="p-5 mb-6 border-b">
                                    <h3 className="text-xl font-semibold text-[#111315] mb-2">
                                        {section.section_data.section_title}
                                    </h3>
                                    <p className="text-gray-500 mb-3">
                                        From: {section.post?.title || 'Unknown Post'}
                                    </p>
                                    <div className="text-[16px] leading-[24px] text-[#111315]">
                                        {section.section_data.section_content ? (
                                            <div className="border p-4 rounded-lg">
                                                {typeof section.section_data.section_content === 'string' ? (
                                                    <div dangerouslySetInnerHTML={{ __html: section.section_data.section_content }}></div>
                                                ) : Array.isArray(section.section_data.section_content) ? (
                                                    /* Render array of blocks content */
                                                    <div>
                                                        {section.section_data.section_content.map((block, index) => {
                                                            if (block.type === "paragraph")
                                                                return <div key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: block.data?.text || '' }}></div>;
                                                            if (block.type === "header")
                                                                return <div key={index} className="mb-3 font-bold" dangerouslySetInnerHTML={{ __html: block.data?.text || '' }}></div>;
                                                            if (block.type === "list")
                                                                return (
                                                                    <div key={index} className="mb-3">
                                                                        <ul className="list-disc list-inside ml-4">
                                                                            {block.data?.items?.map((item, itemIndex) => (
                                                                                <li key={itemIndex} className="mb-1" dangerouslySetInnerHTML={{ __html: item }}></li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                );
                                                            if (block.type === "raw")
                                                                return <div key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }}></div>;
                                                            if (block.type === "code")
                                                                return (
                                                                    <div key={index} className="mb-3 bg-gray-100 p-3 rounded font-mono text-sm">
                                                                        <pre>{block.data?.code || ''}</pre>
                                                                    </div>
                                                                );
                                                            if (block.type === "quote")
                                                                return (
                                                                    <div key={index} className="mb-3 border-l-4 border-gray-300 pl-4 italic">
                                                                        {block.data?.text && <div dangerouslySetInnerHTML={{ __html: block.data.text }}></div>}
                                                                    </div>
                                                                );
                                                            return null;
                                                        })}
                                                    </div>
                                                ) : section.section_data.section_content.data?.children ? (
                                                    /* Render toggle children content */
                                                    <div>
                                                        {section.section_data.section_content.data.children.map((subBlock, index) => {
                                                            if (subBlock.type === "paragraph")
                                                                return <div key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: subBlock.data?.text || '' }}></div>;
                                                            if (subBlock.type === "header")
                                                                return <div key={index} className="mb-3 font-bold" dangerouslySetInnerHTML={{ __html: subBlock.data?.text || '' }}></div>;
                                                            if (subBlock.type === "list")
                                                                return (
                                                                    <div key={index} className="mb-3">
                                                                        <ul className="list-disc list-inside ml-4">
                                                                            {subBlock.data?.items?.map((item, itemIndex) => (
                                                                                <li key={itemIndex} className="mb-1" dangerouslySetInnerHTML={{ __html: item }}></li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                );
                                                            if (subBlock.type === "raw")
                                                                return <div key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: subBlock.data?.html || '' }}></div>;
                                                            if (subBlock.type === "code")
                                                                return (
                                                                    <div key={index} className="mb-3 bg-gray-100 p-3 rounded font-mono text-sm">
                                                                        <pre>{subBlock.data?.code || ''}</pre>
                                                                    </div>
                                                                );
                                                            if (subBlock.type === "quote")
                                                                return (
                                                                    <div key={index} className="mb-3 border-l-4 border-gray-300 pl-4 italic">
                                                                        {subBlock.data?.text && <div dangerouslySetInnerHTML={{ __html: subBlock.data.text }}></div>}
                                                                    </div>
                                                                );
                                                            return null;
                                                        })}
                                                    </div>
                                                ) : (
                                                    /* If there's no children data but we have the section content block */
                                                    <div>
                                                        <div className="mb-3 italic text-gray-700">
                                                            Toggle section without detailed content
                                                        </div>
                                                        {section.section_data.section_content.data?.text && (
                                                            <div dangerouslySetInnerHTML={{ __html: section.section_data.section_content.data.text }}></div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border p-4 rounded-lg bg-gray-50">
                                                <p className="italic text-gray-600">
                                                    This section was selected from the post: {section.post?.title || 'Unknown Post'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {decisions.length === 0 && sectionDecisions.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-lg text-gray-600">No decisions to display.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
