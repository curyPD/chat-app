import { Link, useLoaderData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get } from "firebase/database";

export async function loader({ params }) {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { uid } = currentUser;
    const [chatShapshot, messagesSnapshot] = await Promise.all([
        get(ref(database, `data/chats/${uid}/${params.chatId}`)),
        get(ref(database, `data/messages/${params.chatId}`)),
    ]);
    if (!chatShapshot.exists())
        throw new Response("No chat found", { status: 404 });
    const chatVal = chatShapshot.val();
    const messagesVal = messagesSnapshot.val();
    console.log(chatVal, messagesVal);
    return {
        chatData: chatVal,
        messagesData: messagesVal,
    };
}

export default function Chat() {
    const { chatData, messagesData } = useLoaderData();
    return (
        <>
            <Link to={`/users/${chatData.partner_uid}`}>
                {chatData.partner_name}
            </Link>
        </>
    );
}
