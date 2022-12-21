import {
    HiOutlineSun,
    HiOutlineMoon,
    HiOutlineComputerDesktop,
} from "react-icons/hi2";
import useTheme from "../hooks/useTheme";

export default function ThemeSelectMenu() {
    const theme = useTheme();

    return (
        <div className="grid grid-cols-3 divide-x overflow-hidden rounded-md border border-slate-300">
            <button
                onClick={theme.setToLight}
                className="flex items-center justify-center gap-2 bg-white py-3 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-100 lg:gap-3"
            >
                <HiOutlineSun
                    className={`h-4 w-4 ${
                        theme.theme === "light"
                            ? "text-sky-500"
                            : "text-slate-400"
                    } lg:h-6 lg:w-6`}
                />
                <span
                    className={`text-xs ${
                        theme.theme === "light"
                            ? "font-semibold text-sky-500"
                            : "font-medium text-slate-700"
                    } lg:text-sm`}
                >
                    Light
                </span>
            </button>
            <button
                onClick={theme.setToDark}
                className="flex items-center justify-center gap-2 bg-white py-3 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-100 lg:gap-3"
            >
                <HiOutlineMoon
                    className={`h-4 w-4 ${
                        theme.theme === "dark"
                            ? "text-sky-500"
                            : "text-slate-400"
                    } lg:h-6 lg:w-6`}
                />
                <span
                    className={`text-xs ${
                        theme.theme === "dark"
                            ? "font-semibold text-sky-500"
                            : "font-medium text-slate-700"
                    } lg:text-sm`}
                >
                    Dark
                </span>
            </button>
            <button
                onClick={theme.setToSystem}
                className="flex items-center justify-center gap-2 bg-white py-3 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-100 lg:gap-3"
            >
                <HiOutlineComputerDesktop
                    className={`h-4 w-4 ${
                        !theme.theme ? "text-sky-500" : "text-slate-400"
                    } lg:h-6 lg:w-6`}
                />
                <span
                    className={`text-xs ${
                        !theme.theme
                            ? "font-semibold text-sky-500"
                            : "font-medium text-slate-700"
                    } lg:text-sm`}
                >
                    System
                </span>
            </button>
        </div>
    );
}
