import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginAPI } from "../api/auth";
import { CgSpinner } from "react-icons/cg";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "react-auth-kit";

export default function LoginPage() {
    const { getValues, register, handleSubmit, formState: { errors } } = useForm()

    const [submitButtonStatus, setSubmitButtonStatus] = useState(null)
    
    const navigate = useNavigate();
    const signIn = useSignIn()

    async function onSubmit(data) {

        setSubmitButtonStatus('loading')

        // call login api function 
        const repsponse = await loginAPI({
            email: data['email'],
            password: data['password']
        }).then((response) => {
            if (response.status == 'success') {

                if (signIn(
                    {
                        token: response.response.token,
                        expiresIn: 131400,
                        tokenType: "Bearer",
                        authState: response.response.user
                    }
                )) {
                    setSubmitButtonStatus(null)
                    navigate('/dashboard')
                }
                
            } else {
                setSubmitButtonStatus(null)
                toast.error(response.message)
            }
        });

        setSubmitButtonStatus(null)

    }

    return (
        <>
            <Helmet>
                <title>DSS | Registration</title>
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

            <section className="my-[55px] bg-[#202427] md:rounded-[12px] max-w-xl mx-auto px-[16px] md:px-[105px] py-[60px]">
                <h1 className="text-white text-[24px] leading-[29px] font-medium mb-[43px]">Sign in</h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-y-[19px] mb-[31px]">

                        <Input
                            name={'email'}
                            title={"Email"}
                            type={'email'}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true, pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ }}
                            error={errors['email']}
                            rootClasses={'col-span-2 md:col-span-1'} />

                        <Input
                            name={'password'}
                            title={"Password"}
                            type={'password'}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true }}
                            error={errors['password']}
                            rootClasses={'col-span-2 md:col-span-1'} />
                    </div>

                    <button type="submit" className="ml-auto flex bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium">
                        {
                            submitButtonStatus === 'loading' ? (
                                <CgSpinner className="animate-spin" />
                            ) : 'Login'
                        }
                    </button>
                </form>
            </section>

        </>
    )

}