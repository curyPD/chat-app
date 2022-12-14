import { useState, useEffect } from "react";

const getWidth = function () {
    return window.innerWidth;
};

export default function useCurrentWidth() {
    const [width, setWidth] = useState(getWidth());

    useEffect(() => {
        const resizeListener = () => {
            setWidth(getWidth());
        };
        window.addEventListener("resize", resizeListener);

        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    }, []);

    return width;
}
