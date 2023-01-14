import { auth, database } from "../firebase";
import { ref, update } from "firebase/database";

export async function action({ request, params }) {
    const formData = await request.formData();
    const response = {};
    try {
        const messageId = formData.get("messageId");
        const isLastMessage = formData.get("isLastMessage");
        const isOnlyMessage = formData.get("isOnlyMessage");
        const updates = {};
        updates[`messages/${params.chatId}/${messageId}`] = null;
        if (isLastMessage === "true" && isOnlyMessage !== "true") {
            const newLastMessageText = formData.get("newLastMessageText");
            const newLastMessageSender = formData.get("newLastMessageSender");
            const timestamp = formData.get("timestamp");
            const partnerUid = formData.get("partnerUid");
            [auth.currentUser.uid, partnerUid].forEach((uid) => {
                updates[`chats/${uid}/${params.chatId}/last_message_text`] =
                    newLastMessageText;
                updates[`chats/${uid}/${params.chatId}/last_message_sender`] =
                    newLastMessageSender;
                updates[`chats/${uid}/${params.chatId}/timestamp`] = timestamp;
            });
        } else if (isLastMessage === "true" && isOnlyMessage === "true") {
            const partnerUid = formData.get("partnerUid");
            [auth.currentUser.uid, partnerUid].forEach((uid) => {
                updates[`chats/${uid}/${params.chatId}/last_message_text`] =
                    null;
                updates[`chats/${uid}/${params.chatId}/last_message_sender`] =
                    null;
                updates[`chats/${uid}/${params.chatId}/timestamp`] = null;
            });
        }
        return update(ref(database), updates);
    } catch (err) {
        console.error(err);
        response.error = "Couldn't delete the message. Please try again.";
        return response;
    }
}
