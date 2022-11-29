import { database, storage } from "./firebase";
import { ref, push } from "firebase/database";
import {
    ref as storageRef,
    uploadString,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

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
    let file_url = "";
    if (file) {
        const snapshot = await uploadString(
            storageRef(storage, `chats/${chatId}/${newMessageRef.key}`),
            file,
            "data_url"
        );
        file_url = await getDownloadURL(snapshot.ref);
    }
    updates[`data/messages/${chatId}/${newMessageRef.key}`] = {
        m_id: newMessageRef.key,
        text: message,
        timestamp,
        sender,
        file_url,
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
    fileURL,
    prevAttachedFileURL,
    updates
) {
    updates[`data/messages/${chatId}/${messageId}/text`] = message;
    if (isLastMessage === "true") {
        [sender, recipient].forEach((uid) => {
            updates[`data/chats/${uid}/${chatId}/last_message_text`] = message;
        });
    }

    if (prevAttachedFileURL) {
        if (prevAttachedFileURL === fileURL) {
            // 1. Edit message with file and didn't change the file
            return;
        } else if (!fileURL) {
            // 2. Edit message with file and deleted the file
            await deleteObject(
                storageRef(storage, `chats/${chatId}/${messageId}`)
            );
            updates[`data/messages/${chatId}/${messageId}/file_url`] = "";
            return;
        } else if (fileURL && prevAttachedFileURL !== fileURL) {
            // 3. Edit message with file and changed the file
            const storageReference = storageRef(
                storage,
                `chats/${chatId}/${messageId}`
            );
            await deleteObject(storageReference);
            const snapshot = await uploadString(
                storageReference,
                fileURL,
                "data_url"
            );
            const file_url = await getDownloadURL(snapshot.ref);
            updates[`data/messages/${chatId}/${messageId}/file_url`] = file_url;
        }
    } else {
        if (!fileURL) {
            // 4. Edit message with no file and didn't attach a file
            return;
        } else {
            // 5. Edit message with no file and attached a new file
            const storageReference = storageRef(
                storage,
                `chats/${chatId}/${messageId}`
            );
            const snapshot = await uploadString(
                storageReference,
                fileURL,
                "data_url"
            );
            const file_url = await getDownloadURL(snapshot.ref);
            updates[`data/messages/${chatId}/${messageId}/file_url`] = file_url;
        }
    }
};

export const getAuthProviderObject = function (authProvider) {
    if (authProvider === "google") return new GoogleAuthProvider();
    if (authProvider === "facebook") return new FacebookAuthProvider();
};

export const getAuthCredential = function (providerId, providerToken) {
    if (providerId === "google.com")
        return GoogleAuthProvider.credential(providerToken);
    if (providerId === "facebook.com")
        return FacebookAuthProvider.credential(providerToken);
};

export const getAuthToken = function (authProvider, error) {
    if (authProvider === "google") {
        const credential = GoogleAuthProvider.credentialFromError(error);
        return credential.accessToken;
    } else if (authProvider === "facebook") {
        const credential = FacebookAuthProvider.credentialFromError(error);
        return credential.accessToken;
    }
};

export const getProviderId = function (authProvider, error) {
    if (authProvider === "google") {
        const credential = GoogleAuthProvider.credentialFromError(error);
        return credential.providerId;
    } else if (authProvider === "facebook") {
        const credential = FacebookAuthProvider.credentialFromError(error);
        return credential.providerId;
    }
};
