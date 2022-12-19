import { useState } from "react";
import Overlay from "./Overlay";
import Form from "react-router-dom";
import { HiXMark } from "react-icons/hi2";

export default function FirstMessageDialogWindow(props) {
    const [input, setInput] = useState("");

    return (
        <Overlay onClick={props.closeDialog}>
            <div className="fixed top-1/2 left-1/2 z-50 w-52 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-4 pt-4 pb-2 shadow-md md:pt-5 md:pb-3 lg:w-60 lg:pt-6">
                <button
                    onClick={props.closePopup}
                    className="group absolute top-0 right-0 translate-y-2 -translate-x-2"
                >
                    <HiXMark className="h-4 w-4 text-slate-700 transition-colors group-hover:text-slate-900 md:h-5 md:w-5" />
                </button>
                <p className="mb-5 text-sm font-medium text-slate-900 md:mb-6 md:text-base">
                    Send message to {props.profileInfo.name}
                </p>
                <Form
                    method="post"
                    onSubmit={(e) => {
                        if (!input) e.preventDefault();
                    }}
                >
                    <input
                        type="text"
                        name="message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="block border border-slate-500"
                    />
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
