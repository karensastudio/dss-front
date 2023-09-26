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

        window.onafterprint = () => {
            navigate('/');
        };

        return () => {
            window.onafterprint = null;
        };
    }, []);

    useEffect(() => {
        if (decisions.length > 0) {
            window.print();
        }
    }, [decisions]);

    return (
        <div className="bg-white">
            {loading ? (
                <div className="flex items-center justify-center">
                    <CgSpinner className="text-[20px] animate-spin" />
                </div>
            ) : (
                decisions.map((decision, index) => (
                    <div key={decision.id} className={`decision-item py-5 ${index !== decisions.length - 1 ? 'border-b' : ''}`}>
                        <span className="title-text text-[18px] font-[600] text-[#111315]">
                            {decision.title}
                        </span>
                        <div className="mx-[40px] py-[24px]">
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
    );
}
