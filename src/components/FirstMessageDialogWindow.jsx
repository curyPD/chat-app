import { useState } from "react";
import Overlay from "./Overlay";
import { Form } from "react-router-dom";
import { HiXMark } from "react-icons/hi2";

export default function FirstMessageDialogWindow(props) {
    const [input, setInput] = useState("");

    return (
        <Overlay onClick={props.closeDialog}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="fixed top-1/2 left-1/2 z-50 w-10/12 max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-4 pt-4 pb-2 shadow-md dark:bg-slate-800 md:max-w-sm md:px-5 md:pt-5 md:pb-3 lg:max-w-md lg:px-6 lg:pt-6"
            >
                <button
                    onClick={props.closeDialog}
                    className="group absolute top-0 right-0 translate-y-2 -translate-x-2"
                >
                    <HiXMark className="h-4 w-4 text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 md:h-5 md:w-5" />
                </button>
                <p className="mb-5 text-sm font-medium text-slate-900 dark:text-slate-300 md:mb-6 md:text-base">
                    Send message to {props.profileInfo.name}
                </p>

                <Form
                    method="post"
                    onSubmit={(e) => {
                        if (!input) e.preventDefault();
                    }}
                >
                    <label
                        htmlFor="message"
                        className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-400 lg:text-sm"
                    >
                        Message
                    </label>
                    <input
                        id="message"
                        type="text"
                        name="message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <button
                            className="rounded-md py-1 px-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 lg:px-3 lg:py-1.5 lg:text-sm"
                            type="button"
                            onClick={props.closeDialog}
                        >
                            Cancel
                        </button>
                        <button className="rounded-md bg-sky-500 py-1 px-2 text-xs font-medium text-white transition-colors hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 lg:py-1.5 lg:px-3 lg:text-sm">
                            Submit
                        </button>
                    </div>
                    <input
                        type="hidden"
                        name="partnerUid"
                        value={props.profileInfo.uid}
                    />
                    <input
                        type="hidden"
                        name="partnerName"
                        value={props.profileInfo.name}
                    />
                    <input
                        type="hidden"
                        name="partnerProfilePicture"
                        value={props.profileInfo.profile_picture_sm}
                    />
                    <input
                        type="hidden"
                        name="curUserUid"
                        value={props.curUserProfileInfo.uid}
                    />
                    <input
                        type="hidden"
                        name="curUserName"
                        value={props.curUserProfileInfo.name}
                    />
                    <input
                        type="hidden"
                        name="curUserProfilePicture"
                        value={props.curUserProfileInfo.profile_picture_sm}
                    />
                </Form>
            </div>
        </Overlay>
    );
}
