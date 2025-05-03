import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { getDecisionsApi } from "../api/decision";
import parse from 'html-react-parser';
import { CgSpinner } from 'react-icons/cg';
import { sectionDecisionStorage } from "../utils/sectionDecisionStorage";

export default function DecisionPdfPage() {
    const [decisions, setDecisions] = useState([]);
    const [sectionDecisions, setSectionDecisions] = useState([]);
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
            // Expand all details elements
            const details = document.querySelectorAll('details');
            details.forEach((targetDetail) => {
                targetDetail.setAttribute('open', '');
            });
            window.print();
        }
    }, [decisions, sectionDecisions, loading]);
    
    // Helper function to render section content
    const renderSectionContent = (section) => {
        if (!section.section_data.section_content) return null;
        
        if (typeof section.section_data.section_content === 'string') {
            return <div>{parse(section.section_data.section_content)}</div>;
        }
        
        if (Array.isArray(section.section_data.section_content)) {
            return (
                <div>
                    {section.section_data.section_content.map((block, index) => {
                        try {
                            if (block.type === "paragraph")
                                return <div key={index} className="mb-3">{parse(block.data?.text || '')}</div>;
                            
                            if (block.type === "header")
                                return <div key={index} className="mb-3 font-bold">{parse(block.data?.text || '')}</div>;
                            
                            if (block.type === "list")
                                return (
                                    <div key={index} className="mb-3">
                                        <ul className="list-disc list-inside ml-4">
                                            {block.data?.items?.map((item, itemIndex) => (
                                                <li className="mb-2" key={itemIndex}>{parse(item)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            
                            if (block.type === "code")
                                return (
                                    <div key={index} className="mb-3 bg-gray-100 p-3 rounded font-mono text-sm">
                                        <pre>{block.data?.code || ''}</pre>
                                    </div>
                                );
                            
                            if (block.type === "quote")
                                return (
                                    <div key={index} className="mb-3 border-l-4 border-gray-300 pl-4 italic">
                                        {block.data?.text && <div>{parse(block.data.text)}</div>}
                                    </div>
                                );

                            return null;
                        } catch (error) {
                            console.error(`Error rendering block ${index}:`, error);
                            return null;
                        }
                    })}
                </div>
            );
        }
        
        return null;
    };

    // Helper function to render post content blocks
    const renderPostContent = (blocks) => {
        if (!blocks || !Array.isArray(blocks)) return null;
        
        return blocks.map((block, index) => {
            if (block.type === "paragraph")
                return <div key={index} className="mb-3">{parse(block.data?.text || '')}</div>;
                
            if (block.type === "header")
                return <div key={index} className="mb-3 font-bold">{parse(block.data?.text || '')}</div>;
                
            if (block.type === "Image" && block.data?.url)
                return (
                    <div key={index} className="mb-3">
                        <img src={block.data.url} alt={block.data.caption || ''} className="max-w-full h-auto" />
                        {block.data.caption && <div className="text-sm text-center mt-1">{block.data.caption}</div>}
                    </div>
                );
                
            if (block.type === "list")
                return (
                    <div key={index} className="mb-3">
                        <ul className="list-disc list-inside ml-4">
                            {block.data?.items?.map((item, itemIndex) => (
                                <li key={itemIndex} className="mb-2">{parse(item)}</li>
                            ))}
                        </ul>
                    </div>
                );
                
            return null;
        });
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
                                <div key={decision.id} className="p-5 mb-6 border-b">
                                    <h3 className="text-xl font-semibold text-[#111315] mb-2">
                                        {decision.title}
                                    </h3>
                                    {decision?.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {decision.tags.map(tag => (
                                                <span key={tag.id} className="px-2 py-1 text-xs border border-gray-300 rounded-full">
                                                    #{tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-[16px] leading-[24px] text-[#111315]">
                                        {decision?.description && renderPostContent(JSON.parse(decision.description).blocks)}
                                    </div>
                                    {decision.notes?.length > 0 && (
                                        <div className="border rounded p-3 mt-4 text-[16px] leading-[24px] text-[#111315]">
                                            <h4 className="font-bold py-2">Notes:</h4>
                                            <div className="flex flex-col space-y-2">
                                                {decision.notes.map((note, index) => (
                                                    <div key={index} className="py-2 border-t first:border-t-0">
                                                        {note.note}
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
                                    <div className="border p-4 rounded-lg bg-gray-50">
                                        {renderSectionContent(section)}
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
