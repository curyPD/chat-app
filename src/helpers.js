import { database } from "./firebase";
import { ref, push } from "firebase/database";

export const addNewChat = function (updates, curUser, otherUser) {
    const newChatKey = push(ref(database, `data/chats/${curUser.uid}`)).key;
    [curUser, otherUser].forEach((user, i, arr) => {
        updates[`data/chats/${user.uid}/${newChatKey}/chat_id`] = newChatKey;
        updates[`data/chats/${user.uid}/${newChatKey}/partner_uid`] =
            arr[i === 0 ? 1 : 0].uid;
        updates[`data/chats/${user.uid}/${newChatKey}/partner_name`] =
            arr[i === 0 ? 1 : 0].name;
        updates[
            `data/chats/${user.uid}/${newChatKey}/partner_profile_picture`
        ] = arr[i === 0 ? 1 : 0].profilePicture;
        updates[`data/users/${user.uid}/chats/${newChatKey}/chat_id`] =
            newChatKey;
        updates[`data/users/${user.uid}/chats/${newChatKey}/partner_uid`] =
            arr[i === 0 ? 1 : 0].uid;
    });
    return newChatKey;
};

export const addNewMessage = function (
    chatId,
    message,
    sender,
    recipient,
    updates
) {
    const newMessageRef = push(ref(database, `data/messages/${chatId}`));
    const date = new Date();
    const timestamp = date.getTime();
    updates[`data/messages/${chatId}/${newMessageRef.key}`] = {
        m_id: newMessageRef.key,
        text: message,
        timestamp,
        sender,
    };
    [sender, recipient].forEach((uid) => {
        updates[`data/chats/${uid}/${chatId}/last_message_sender`] = sender;
        updates[`data/chats/${uid}/${chatId}/last_message_text`] = message;
        updates[`data/chats/${uid}/${chatId}/timestamp`] = timestamp;
    });
};

export const editMessage = function (
    chatId,
    message,
    messageId,
    isLastMessage,
    sender,
    recipient,
    updates
) {
    updates[`data/messages/${chatId}/${messageId}/text`] = message;
    if (isLastMessage === "true") {
        [sender, recipient].forEach((uid) => {
            updates[`data/chats/${uid}/${chatId}/last_message_text`] = message;
        });
    }
};
