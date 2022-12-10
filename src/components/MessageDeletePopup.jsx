import Overlay from "./Overlay";
import { HiXMark } from "react-icons/hi2";

export default function MessageDeletePopup(props) {
    return (
        <Overlay onClick={props.closePopup}>
            <div className="fixed top-1/2 left-1/2 z-30 w-52 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-4 pt-4 pb-2 shadow-md">
                <button
                    onClick={props.closePopup}
                    className="absolute top-0 right-0 translate-y-2 -translate-x-2"
                >
                    <HiXMark className="h-4 w-4 text-slate-700" />
                </button>
                <p className="mb-5 text-sm font-medium text-slate-900">
                    Delete message?
                </p>
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="rounded-md py-1 px-2 text-xs font-medium text-slate-900"
                        onClick={props.closePopup}
                    >
                        Cancel
                    </button>
                    <button
                        className="rounded-md bg-red-500 py-1 px-2 text-xs font-medium text-white"
                        onClick={props.handleDeleteMessage}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Overlay>
    );
}
