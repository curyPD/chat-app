import { Link, useLoaderData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get } from "firebase/database";

export async function loader({ params }) {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { uid } = currentUser;
    const chatShapshot = await get(
        ref(database, `data/chats/${uid}/${params.chatId}`)
    );
    if (!chatShapshot.exists())
        throw new Response("No chat found", { status: 404 });
    const chatVal = chatShapshot.val();
    console.log(chatVal);
    return {
        chatData: chatVal,
    };
}

export default function Chat() {
    const { chatData } = useLoaderData();
    return (
        <>
            <Link to={`/users/${chatData.partner_uid}`}>
                {chatData.partner_name}
            </Link>
        </>
    );
}
