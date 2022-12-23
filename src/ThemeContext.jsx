import { createContext, useContext, useEffect } from "react";
import useLocalStorage from "use-local-storage";

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
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

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}
