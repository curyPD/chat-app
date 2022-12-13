import Overlay from "./Overlay";
import { HiXMark, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";

export default function MessagePopup(props) {
    return (
        <Overlay onClick={props.closePopup}>
            <div className="fixed top-1/2 left-1/2 z-30 w-52 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white pt-4 pb-2 shadow-md md:pt-5">
                <button
                    onClick={props.closePopup}
                    className="absolute top-0 right-0 translate-y-2 -translate-x-2"
                >
                    <HiXMark className="h-4 w-4 text-slate-700 md:h-5 md:w-5" />
                </button>
                <button
                    className="flex w-full items-center gap-5 py-3 px-5"
                    onClick={props.handleEditMessage}
                >
                    <HiOutlinePencil className="h-5 w-5 text-sky-500" />
                    <span className="text-sm font-medium text-slate-800">
                        Edit message
                    </span>
                </button>
                <button
                    className="flex w-full items-center gap-5 py-3 px-5"
                    onClick={props.openDeletePopup}
                >
                    <HiOutlineTrash className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-slate-800">
                        Delete message
                    </span>
                </button>
            </div>
        </Overlay>
    );
}
