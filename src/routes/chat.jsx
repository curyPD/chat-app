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
    const chatVal = chatShapshot.val();
    const messagesVal = messagesSnapshot.val();
    console.log(chatVal, messagesVal);
}

export default function Chat() {
    return <div>Chat</div>;
}
