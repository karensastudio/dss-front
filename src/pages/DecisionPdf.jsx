import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { getDecisionsApi } from "../api/decision";
import parse from 'html-react-parser';
import { CgSpinner } from 'react-icons/cg';
import { sectionDecisionStorage } from "../utils/sectionDecisionStorage";
import { DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export default function DecisionPdfPage() {
    const [decisions, setDecisions] = useState([]);
    const [sectionDecisions, setSectionDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportDate] = useState(new Date());
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
            
            // Give a brief moment for the report to render properly
            setTimeout(() => {
                window.print();
            }, 500);
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

    // Helper function to create a table of contents
    const generateTableOfContents = () => {
        if (decisions.length === 0 && sectionDecisions.length === 0) return null;
        
        return (
            <div className="print-toc">
                <h2 className="print-toc-title">Table of Contents</h2>
                
                <div className="my-4">
                    {decisions.length > 0 && (
                        <>
                            <div className="print-toc-item">
                                <span className="print-toc-text font-semibold">Full Posts</span>
                            </div>
                            {decisions.map((decision, index) => (
                                <div key={decision.id} className="print-toc-item pl-4">
                                    <span className="print-toc-text">{decision.title}</span>
                                </div>
                            ))}
                        </>
                    )}
                    
                    {sectionDecisions.length > 0 && (
                        <>
                            <div className="print-toc-item mt-2">
                                <span className="print-toc-text font-semibold">Section Decisions</span>
                            </div>
                            {sectionDecisions.map((section, index) => (
                                <div key={section.id} className="print-toc-item pl-4">
                                    <span className="print-toc-text">{section.section_data.section_title}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        );
    };

    // Format the current date
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto p-8 print-container">
            {/* Add watermark for printed version */}
            <div className="print-watermark">DSS</div>
            
            {loading ? (
                <div className="flex justify-center">
                    <CgSpinner className="animate-spin text-4xl" />
                </div>
            ) : (
                <div>
                    {/* Report Header */}
                    <div className="print-header">
                        <h1 className="print-title">Decision Support System Report</h1>
                        <div className="print-subtitle">Document decisions and selected sections</div>
                        <div className="print-date">Generated on {formatDate(reportDate)}</div>
                    </div>
                    
                    {/* Table of Contents */}
                    {generateTableOfContents()}
                    
                    {decisions.length === 0 && sectionDecisions.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-lg text-gray-600">No decisions to display.</p>
                        </div>
                    ) : (
                        <>
                            {/* Full Posts Section */}
                            {decisions.length > 0 && (
                                <div className="print-section">
                                    <h2 className="print-section-title">
                                        <DocumentTextIcon className="h-6 w-6 inline-block mr-2 mb-1" />
                                        Full Posts
                                    </h2>
                                    
                                    {decisions.map((decision) => (
                                        <div key={decision.id} className="print-item">
                                            <div className="print-item-header">
                                                <h3 className="print-item-title">{decision.title}</h3>
                                            </div>
                                            
                                            {decision?.tags?.length > 0 && (
                                                <div className="print-tags">
                                                    {decision.tags.map(tag => (
                                                        <span key={tag.id} className="print-tag">
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="print-item-content">
                                                {decision?.description && renderPostContent(JSON.parse(decision.description).blocks)}
                                            </div>
                                            
                                            {decision.notes?.length > 0 && (
                                                <div className="print-notes">
                                                    <h4 className="print-notes-title">Notes:</h4>
                                                    <div>
                                                        {decision.notes.map((note, index) => (
                                                            <div key={index} className="print-note-item">
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
                            
                            {/* Add a page break between sections if both exist */}
                            {decisions.length > 0 && sectionDecisions.length > 0 && (
                                <div className="page-break"></div>
                            )}
                            
                            {/* Sections Section */}
                            {sectionDecisions.length > 0 && (
                                <div className="print-section">
                                    <h2 className="print-section-title">
                                        <ClipboardDocumentIcon className="h-6 w-6 inline-block mr-2 mb-1" />
                                        Section Decisions
                                    </h2>
                                    
                                    {sectionDecisions.map((section) => (
                                        <div key={section.id} className="print-item">
                                            <div className="print-item-header">
                                                <h3 className="print-item-title">{section.section_data.section_title}</h3>
                                            </div>
                                            
                                            <p className="print-item-source">
                                                From: {section.post?.title || 'Unknown Post'}
                                            </p>
                                            
                                            <div className="print-item-content">
                                                {renderSectionContent(section)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Footer */}
                            <div className="print-footer">
                                <div>Decision Support System</div>
                                <div className="print-footer-page">Page </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
