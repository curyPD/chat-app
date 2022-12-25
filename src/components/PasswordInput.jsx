import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

export default function PasswordInput(props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    function togglePasswordVisibility() {
        return setIsPasswordVisible((prevValue) => !prevValue);
    }

    return (
        <div className="relative">
            <input
                type={isPasswordVisible ? "text" : "password"}
                required={props.required ?? false}
                id={props.id}
                name={props.name}
                className={props.className}
                autoComplete={props.autoComplete}
            />
            <button
                type="button"
                className="group absolute top-1/2 right-0 flex h-9 w-9 -translate-y-1/2 translate-x-0.5 items-center justify-center rounded-full transition-colors hover:bg-slate-200/50 focus:outline-none focus-visible:bg-slate-200/50 dark:hover:bg-slate-700/50 dark:focus-visible:bg-slate-700/50 lg:h-12 lg:w-12"
                onClick={togglePasswordVisibility}
            >
                {isPasswordVisible ? (
                    <HiOutlineEyeSlash className="h-5 w-5 text-slate-400 transition-colors group-hover:text-sky-400 lg:h-6 lg:w-6" />
                ) : (
                    <HiOutlineEye className="h-5 w-5 text-slate-400 transition-colors group-hover:text-sky-400 lg:h-6 lg:w-6" />
                )}
            </button>
        </div>
    );
}
