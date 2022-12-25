import { database, storage, auth } from "./firebase";
import { ref, push } from "firebase/database";
import {
    ref as storageRef,
    uploadString,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import Resizer from "react-image-file-resizer";

export const resizeFile = function (file, maxW, maxH, q, minW, minH) {
    return new Promise((resolve) => {
        Resizer.imageFileResizer(
            file,
            maxW,
            maxH,
            "JPEG",
            q,
            0,
            (uri) => {
                resolve(uri);
            },
            "base64",
            minW,
            minH
        );
    });
};

export async function handleAvatarUpload(e, submit, setError) {
    try {
        const file = e.target.files[0];
        const imageSm = await resizeFile(file, 96, 96, 60, 96, 48);
        const imageLg = await resizeFile(file, 224, 224, 80, 224, 112);
        const snapshotSm = await uploadString(
            storageRef(storage, `avatars/${auth.currentUser.uid}/sm`),
            imageSm,
            "data_url"
        );
        const snapshotLg = await uploadString(
            storageRef(storage, `avatars/${auth.currentUser.uid}/lg`),
            imageLg,
            "data_url"
        );
        const avatarSm = await getDownloadURL(snapshotSm.ref);
        const avatarLg = await getDownloadURL(snapshotLg.ref);
        const formData = new FormData();
        formData.append("avatarSm", avatarSm);
        formData.append("avatarLg", avatarLg);
        submit(formData, {
            method: "post",
        });
    } catch (err) {
        console.error(err);
        setError("Couldn't upload the image. Please try again.");
    }
}

export const addNewChat = function (updates, curUser, otherUser) {
    const newChatKey = push(ref(database, `chats/${curUser.uid}`)).key;
    [curUser, otherUser].forEach((user, i, arr) => {
        updates[`chats/${user.uid}/${newChatKey}/chat_id`] = newChatKey;
        updates[`chats/${user.uid}/${newChatKey}/partner_uid`] =
            arr[i === 0 ? 1 : 0].uid;
        updates[`chats/${user.uid}/${newChatKey}/partner_name`] =
            arr[i === 0 ? 1 : 0].name;
        updates[`chats/${user.uid}/${newChatKey}/partner_profile_picture`] =
            arr[i === 0 ? 1 : 0].profilePicture;
        updates[`users/${user.uid}/chats/${newChatKey}/chat_id`] = newChatKey;
        updates[`users/${user.uid}/chats/${newChatKey}/partner_uid`] =
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
    try {
        const newMessageRef = push(ref(database, `messages/${chatId}`));
        const date = new Date();
        const timestamp = date.getTime();
        let file_url = "";
        if (file) {
            const metadata = {
                customMetadata: {
                    from: sender,
                    to: recipient,
                },
            };
            const snapshot = await uploadString(
                storageRef(storage, `chats/${chatId}/${newMessageRef.key}`),
                file,
                "data_url",
                metadata
            );
            file_url = await getDownloadURL(snapshot.ref);
        }
        updates[`messages/${chatId}/${newMessageRef.key}`] = {
            m_id: newMessageRef.key,
            text: message,
            timestamp,
            sender,
            file_url,
        };
        [sender, recipient].forEach((uid) => {
            updates[`chats/${uid}/${chatId}/last_message_sender`] = sender;
            updates[`chats/${uid}/${chatId}/last_message_text`] = message;
            updates[`chats/${uid}/${chatId}/timestamp`] = timestamp;
        });
    } catch (err) {
        throw err;
    }
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
    try {
        updates[`messages/${chatId}/${messageId}/text`] = message;
        if (isLastMessage === "true") {
            [sender, recipient].forEach((uid) => {
                updates[`chats/${uid}/${chatId}/last_message_text`] = message;
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
                updates[`messages/${chatId}/${messageId}/file_url`] = "";
                return;
            } else if (fileURL && prevAttachedFileURL !== fileURL) {
                // 3. Edit message with file and changed the file
                const storageReference = storageRef(
                    storage,
                    `chats/${chatId}/${messageId}`
                );
                const metadata = {
                    customMetadata: {
                        from: sender,
                        to: recipient,
                    },
                };
                await deleteObject(storageReference);
                const snapshot = await uploadString(
                    storageReference,
                    fileURL,
                    "data_url",
                    metadata
                );
                const file_url = await getDownloadURL(snapshot.ref);
                updates[`messages/${chatId}/${messageId}/file_url`] = file_url;
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
                const metadata = {
                    customMetadata: {
                        from: sender,
                        to: recipient,
                    },
                };
                const snapshot = await uploadString(
                    storageReference,
                    fileURL,
                    "data_url",
                    metadata
                );
                const file_url = await getDownloadURL(snapshot.ref);
                updates[`messages/${chatId}/${messageId}/file_url`] = file_url;
            }
        }
    } catch (err) {
        throw err;
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

export const getProviderIdFromError = function (authProvider, error) {
    if (authProvider === "google") {
        const credential = GoogleAuthProvider.credentialFromError(error);
        return credential.providerId;
    } else if (authProvider === "facebook") {
        const credential = FacebookAuthProvider.credentialFromError(error);
        return credential.providerId;
    }
};

export const getProviderIdFromResult = function (authProvider, result) {
    if (authProvider === "google") {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        return credential.providerId;
    } else if (authProvider === "facebook") {
        const credential = FacebookAuthProvider.credentialFromResult(result);
        return credential.providerId;
    }
};

export const getProviderId = function (authProvider) {
    if (authProvider === "google") {
        return "google.com";
    } else if (authProvider === "facebook") {
        return "facebook.com";
    }
};
