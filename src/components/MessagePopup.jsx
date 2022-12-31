import Overlay from "./Overlay";
import { HiXMark, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { motion } from "framer-motion";

export default function MessagePopup(props) {
    const variants = {
        hidden: { opacity: 0, y: 80 },
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
        exit: { opacity: 0, y: 80 },
    };

    return (
        <Overlay onClick={props.closePopup}>
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                onClick={(e) => e.stopPropagation()}
                className="relative z-50 w-52 rounded-lg bg-white pt-4 pb-2 shadow-md dark:bg-slate-800 md:pb-3 md:pt-5 lg:w-60 lg:pt-6"
            >
                <button
                    onClick={props.closePopup}
                    className="group absolute top-0 right-0 translate-y-2 -translate-x-2"
                >
                    <HiXMark className="h-4 w-4 text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 md:h-5 md:w-5" />
                </button>
                <button
                    className="flex w-full items-center gap-5 py-3 px-5 hover:bg-slate-50 dark:hover:bg-slate-700 lg:px-6"
                    onClick={props.handleEditMessage}
                >
                    <HiOutlinePencil className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-300">
                        Edit message
                    </span>
                </button>
                <button
                    className="flex w-full items-center gap-5 py-3 px-5 hover:bg-slate-50 dark:hover:bg-slate-700 lg:px-6"
                    onClick={props.openDeletePopup}
                >
                    <HiOutlineTrash className="h-5 w-5 text-red-500 dark:text-red-400" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-300">
                        Delete message
                    </span>
                </button>
            </motion.div>
        </Overlay>
    );
}
