import { useState } from "react";
import { useEffect } from "react";

export default function Input(props) {
    const {
        name,
        title,
        placeholder,
        type,
        rootClasses,
        inputClasses,
        labelClasses,
        register,
        validations,
        error
    } = props;

    const [value, setValue] = useState('');

    const errorMessages = () => {
        switch (error.type) {
            case 'required':
                return 'This field is required';
            case 'minLength':
                return `This field must be at least ${validations.minLength} characters`;
            case 'maxLength':
                return `This field must be less than ${validations.maxLength} characters`;
            case 'pattern':
                return `Enter a valid ${title}`;
            case 'validate':
                return `${title} are not same`;
            default:
                return 'This field is invalid';
        }
    }

    return (
        <fieldset htmlFor={name} className={rootClasses}>
            <div className="min-h-[56px] relative flex bg-[#41474D] rounded-[4px] px-[14px] py-[10px] ">
                <input
                    className={`pt-[16px] w-full bg-[#41474D] text-white text-[16px] placeholder-[#FFFFFF] placeholder-opacity-[0.5] outline-none focus:outline-none leading-[20px] font-medium peer ${inputClasses ? inputClasses : ''}`}
                    name={name}
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    {...register(name, validations)}
                    onKeyUp={(e) => setValue(e.target.value)}
                />
                {/* <input type="text" id={name} class="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " /> */}

                <label htmlFor={name} className={`cursor-text text-[#FFFFFF] transition-all absolute top-1/2 -translate-y-1/2 peer-focus:leading-[14px] peer-focus:text-[12px] peer-focus:top-[10px] peer-focus:translate-y-0 peer-focus:opacity-50 ${labelClasses} ${value != '' ? 'leading-[14px] text-[12px] top-[10px] translate-y-0 opacity-50' : 'text-[16px] leading-[20px]' }`} >{title}</label>
            </div>

            {error && <span className="px-[14px] text-red-400 text-[12px]">{errorMessages(error, validations)}</span>}
        </fieldset>
    )

}