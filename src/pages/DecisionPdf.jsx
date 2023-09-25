import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { getDecisionsApi } from "../api/decision";
import { useTheme } from "../context/ThemeContext";


export default function DecisionPdfPage() {
    const { isLightMode } = useTheme();
    const [decisions, setDecisions] = useState([]);
    const navigate = useNavigate();
    const authHeader = useAuthHeader();

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const response = await getDecisionsApi(authHeader());
                if (response.status === 'success') {
                    setDecisions(response.response.posts);
                    window.print();
                } else {
                    setDecisions([]);
                }
            } catch (error) {
                console.error(error);
                setDecisions([]);
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

    return (
        <div className="w-full h-screen bg-white">
            {decisions.map((decision) => (
                <div key={decision.id}>
                    <span className="text-[16px] leading-[24px] text-[#111315]">
                        {decision.title}
                    </span>
                    {decision.notes && decision.notes.length > 0 && (
                        <div className="text-[16px] leading-[24px] text-[#111315]">
                            {decision.notes.map((note, index) => (
                                <React.Fragment key={index}>
                                    <span>{note}</span>
                                    {index !== decision.notes.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}