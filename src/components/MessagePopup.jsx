import Overlay from "./Overlay";
import { HiXMark, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";

export default function MessagePopup(props) {
    return (
        <Overlay onClick={props.closePopup}>
            <div className="fixed top-1/2 left-1/2 z-50 w-52 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white pt-4 pb-2 shadow-md dark:bg-slate-800 md:pb-3 md:pt-5 lg:w-60 lg:pt-6">
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
            </div>
        </Overlay>
    );
}
