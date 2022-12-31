import Overlay from "./Overlay";
import { HiXMark } from "react-icons/hi2";
import { motion } from "framer-motion";

export default function MessageDeletePopup(props) {
    const variants = {
        hidden: { opacity: 0, y: -80 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 23,
                stiffness: 300,
                duration: 0.2,
            },
        },
        exit: { opacity: 0 },
    };

    return (
        <Overlay onClick={props.closePopup}>
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                onClick={(e) => e.stopPropagation()}
                className="relative z-50 w-52 rounded-lg bg-white px-4 pt-4 pb-2 shadow-md dark:bg-slate-800 md:pt-5 md:pb-3 lg:w-60 lg:pt-6"
            >
                <button
                    onClick={props.closePopup}
                    className="group absolute top-0 right-0 translate-y-2 -translate-x-2"
                >
                    <HiXMark className="h-4 w-4 text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 md:h-5 md:w-5" />
                </button>
                <p className="mb-5 text-sm font-medium text-slate-900 dark:text-slate-300 md:mb-6 md:text-base">
                    Delete message?
                </p>
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="rounded-md py-1 px-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 md:py-1.5 md:px-3 md:text-sm"
                        onClick={props.closePopup}
                    >
                        Cancel
                    </button>
                    <button
                        className="rounded-md bg-red-500 py-1 px-2 text-xs font-medium text-white transition-colors hover:bg-red-400 md:py-1.5 md:px-3 md:text-sm"
                        onClick={props.handleDeleteMessage}
                    >
                        Delete
                    </button>
                </div>
            </motion.div>
        </Overlay>
    );
}
