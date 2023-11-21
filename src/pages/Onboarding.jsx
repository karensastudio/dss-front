import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { OnboardAPI } from "../api/onboarding";
import { ToastContainer, toast } from "react-toastify";
import { CgChevronRight, CgSpinner } from "react-icons/cg";

const Questions = [
    {
        slug: 'experience',
        title: 'Is your group new to working with co-creation processes or do you have experience?',
        choices: [
            {
                label: 'Our group is new',
                value: 'new'
            },
            {
                label: 'Our group has experience',
                value: 'experience'
            }
        ]
    },
    {
        slug: 'association',
        title: 'Is your project urban/suburban or is it mostly non-urban (rural, village, coastal)?',
        choices: [
            {
                label: 'Urban/sub-urban',
                value: 'urban'
            },
            {
                label: 'Non-urban (rual, village, coastal)',
                value: 'non-urban'
            }
        ]
    },
    {
        slug: 'initiation',
        title: 'Is your project being initiated by government or large donorfunds or is it a grassroots initiative?',
        choices: [
            {
                label: 'Government / Large donor',
                value: 'government'
            },
            {
                label: 'Grassroots / Community',
                value: 'grassroots'
            }
        ]
    },

]

export default function OnboardingPage() {

    const navigate = useNavigate()
    const authHeader = useAuthHeader();

    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({
        experience: null,
        association: null,
        initiation: null
    });
    const [submitButtonStatus, setSubmitButtonStatus] = useState(null)

    async function handleSelectAnswer(answer) {
        setAnswers({
            ...answers,
            [Questions[step].slug]: answer
        })
        if (step == Questions.length - 1) {
            setSubmitButtonStatus('loading')

            const response = await OnboardAPI(authHeader(), {
                ...answers,
                [Questions[step].slug]: answer
            });

            if (response.status == 'success') {
                navigate('/')
            }
            else {
                toast.error(response.message)
            }
            setSubmitButtonStatus(null)
        } else {
            setStep(step + 1)
        }
    }

    return (
        <>
            <Helmet>
                <title>DSS | Onboarding</title>
            </Helmet>

            <Header />

            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <section className="relative my-[55px] bg-white border shadow md:rounded-[12px] max-w-4xl mx-auto px-[16px] md:px-[105px] py-[60px]">
                {
                    submitButtonStatus == 'loading' && (
                        <div className="absolute w-full h-full left-0 top-0 bg-black bg-opacity-30 rounded-[12px] backdrop-blur-md flex items-center justify-center">
                            <CgSpinner color="white" className="animate-spin text-[48px]" />
                        </div>
                    )
                }
                <h2 className="text-neutral-900 text-[24px] leading-[29px] font-medium mb-[60px]">{Questions[step].title}</h2>

                <div className="flex flex-col gap-y-[16px]">
                    {
                        Questions[step].choices.map((choice, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectAnswer(choice.value)}
                                className="cursor-pointer p-[28px] bg-neutral-50 rounded-[12px] text-neutral-900 border text-[16px] font-medium flex items-center justify-between">
                                {choice.label}

                                <CgChevronRight className="text-[24px]" />
                            </div>
                        ))
                    }
                </div>
            </section>

        </>
    )

}