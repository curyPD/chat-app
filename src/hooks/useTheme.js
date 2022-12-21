import { useEffect } from "react";
import useLocalStorage from "use-local-storage";

export default function useTheme() {
    const [theme, setTheme] = useLocalStorage(
        "theme",
        localStorage.getItem("theme") === "dark" ||
            (!localStorage.getItem("theme") &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light"
    );

    useEffect(() => {
        if (
            theme === "dark" ||
            (!theme &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const value = {
        theme,
        setToLight() {
            return setTheme("light");
        },
        setToDark() {
            return setTheme("dark");
        },
        setToSystem() {
            return setTheme(undefined);
        },
    };

    return value;
}
