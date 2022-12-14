import { useState, useEffect } from "react";
import useCurrentWidth from "./useCurrentWidth";

export default function useCheckIsMobile() {
    const width = useCurrentWidth();
    const [isMobile, setIsMobile] = useState(width < 1024);

    useEffect(() => {
        setIsMobile(width < 1024 ? true : false);
    }, [width]);

    return isMobile;
}
