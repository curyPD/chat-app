import {
    HiOutlineSun,
    HiOutlineMoon,
    HiOutlineComputerDesktop,
} from "react-icons/hi2";
import { useTheme } from "../ThemeContext";

export default function ThemeSelectMenu() {
    const { theme, setToLight, setToDark, setToSystem } = useTheme();

    return (
        <div className="grid grid-cols-3 divide-x overflow-hidden rounded-md border border-slate-300 dark:divide-slate-700 dark:border-slate-700">
            <button
                onClick={setToLight}
                className="flex items-center justify-center gap-2 bg-white py-3 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700 lg:gap-3"
            >
                <HiOutlineSun
                    className={`h-4 w-4 ${
                        theme === "light"
                            ? "text-sky-500 dark:text-sky-400"
                            : "text-slate-400 dark:text-slate-500"
                    } lg:h-6 lg:w-6`}
                />
                <span
                    className={`text-xs ${
                        theme === "light"
                            ? "font-semibold text-sky-500 dark:text-sky-400"
                            : "font-medium text-slate-700 dark:text-slate-300"
                    } lg:text-sm`}
                >
                    Light
                </span>
            </button>
            <button
                onClick={setToDark}
                className="flex items-center justify-center gap-2 bg-white py-3 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700 lg:gap-3"
            >
                <HiOutlineMoon
                    className={`h-4 w-4 ${
                        theme === "dark"
                            ? "text-sky-500 dark:text-sky-400 "
                            : "text-slate-400 dark:text-slate-500 "
                    } lg:h-6 lg:w-6`}
                />
                <span
                    className={`text-xs ${
                        theme === "dark"
                            ? "font-semibold text-sky-500 dark:text-sky-400"
                            : "font-medium text-slate-700 dark:text-slate-300"
                    } lg:text-sm`}
                >
                    Dark
                </span>
            </button>
            <button
                onClick={setToSystem}
                className="flex items-center justify-center gap-2 bg-white py-3 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700 lg:gap-3"
            >
                <HiOutlineComputerDesktop
                    className={`h-4 w-4 ${
                        !theme
                            ? "text-sky-500 dark:text-sky-400"
                            : "text-slate-400 dark:text-slate-500"
                    } lg:h-6 lg:w-6`}
                />
                <span
                    className={`text-xs ${
                        !theme
                            ? "font-semibold text-sky-500 dark:text-sky-400"
                            : "font-medium text-slate-700 dark:text-slate-300"
                    } lg:text-sm`}
                >
                    System
                </span>
            </button>
        </div>
    );
}
