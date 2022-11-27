import { database, storage } from "./firebase";
import { ref, push } from "firebase/database";
import {
    ref as storageRef,
    uploadString,
    getDownloadURL,
} from "firebase/storage";

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

export const addNewMessage = async function (
    chatId,
    message,
    sender,
    recipient,
    file,
    updates
) {
    const newMessageRef = push(ref(database, `data/messages/${chatId}`));
    const date = new Date();
    const timestamp = date.getTime();
    let fileURL = "";
    if (file) {
        const snapshot = await uploadString(
            storageRef(storage, `chats/${chatId}/${newMessageRef.key}`),
            file,
            "data_url"
        );
        console.log(snapshot);
        fileURL = await getDownloadURL(snapshot.ref);
    }
    updates[`data/messages/${chatId}/${newMessageRef.key}`] = {
        m_id: newMessageRef.key,
        text: message,
        timestamp,
        sender,
        file_url: fileURL,
    };
    [sender, recipient].forEach((uid) => {
        updates[`data/chats/${uid}/${chatId}/last_message_sender`] = sender;
        updates[`data/chats/${uid}/${chatId}/last_message_text`] = message;
        updates[`data/chats/${uid}/${chatId}/timestamp`] = timestamp;
    });
};

export const editMessage = async function (
    chatId,
    message,
    messageId,
    isLastMessage,
    sender,
    recipient,
    file,
    updates
) {
    updates[`data/messages/${chatId}/${messageId}/text`] = message;
    if (isLastMessage === "true") {
        [sender, recipient].forEach((uid) => {
            updates[`data/chats/${uid}/${chatId}/last_message_text`] = message;
        });
    }
};
