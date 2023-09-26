import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Checkbox(props) {
    const {
        name,
        rootClasses,
        inputClasses,
        validations,
        register,
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
                return `${title} is already used`;
            default:
                return 'This field is invalid';
        }
    }

    return (
        <fieldset htmlFor={name} className={"flex flex-col text-white text-[16px] leading-[22px] font-medium space-y-[8px] " + rootClasses}>
            <div className="flex space-x-[12px]">
                <input
                    className={"peer h-[20px] w-[20px] border-[1px] border-[#FFFFFF] rounded-[4px] outline-none focus:outline-none " + inputClasses}
                    name={name}
                    id={name}
                    type="checkbox"
                    {...register(name, validations)}
                    onKeyUp={(e) => setValue(e.target.value)}
                />

                <label htmlFor={name} className={`text-[#202427] dark:text-white`}>
                    {props.children}
                </label>
            </div>

            {error && <span className="px-[14px] text-red-400 text-[12px]">{errorMessages(error, validations)}</span>}
        </fieldset>
    )

}