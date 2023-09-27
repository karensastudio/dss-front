import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { getDecisionsApi } from "../api/decision";
import parse from 'html-react-parser';
import { CgSpinner } from 'react-icons/cg';

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

        // window.onafterprint = () => {
        //     navigate('/');
        // };

        return () => {
            window.onafterprint = null;
        };
    }, []);

    useEffect(() => {
        if (decisions.length > 0) {
            // window.print();
        }

        const details = document.querySelectorAll('details');
        details.forEach((targetDetail) => {
            targetDetail.setAttribute('open', '');
        });
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
                                {decision?.description && parse(decision?.description)}
                            </div>
                            {decision.notes && decision.notes.length > 0 && (
                                <div className="text-[16px] leading-[24px] text-[#111315]">
                                    {decision.notes.map((note, index) => (
                                        <React.Fragment key={index}>
                                            <span>{note.message}</span>
                                            {index !== decision.notes.length - 1 && <br />}
                                        </React.Fragment>
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
