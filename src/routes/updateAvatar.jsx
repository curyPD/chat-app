import { auth, database, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import { useFetcher } from "react-router-dom";

export async function action({ request }) {
    const formData = await request.formData();
    const photoURL = formData.get("avatarURL");
    console.log(photoURL);
    const userSnapshot = await get(
        ref(database, `data/users/${auth.currentUser.uid}`)
    );
    const user = userSnapshot.val();
    const updates = {};
    updates[`data/users/${auth.currentUser.uid}/profile_picture`] = photoURL;
    // Object.keys(user.friends).forEach((uid) => {
    //     updates[
    //         `data/users/${uid}/friends/${auth.currentUser.uid}/friend_profile_picture`
    //     ] = photoURL;
    // });
    Object.values(user.chats).forEach((obj) => {
        updates[
            `data/chats/${obj.partner_uid}/${obj.chat_id}/partner_profile_picture`
        ] = photoURL;
    });
    return Promise.all(
        update(database, updates),
        updateProfile(auth.currentUser, {
            photoURL,
        })
    );
}

export default function UpdateAvatar() {
    const fetcher = useFetcher();
    const styles = {
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        overflow: "hidden",
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
    };

    function handleFileUpload(e) {
        const file = e.target.files[0];
        const uploadTask = uploadBytesResumable(
            storageRef(storage, `avatars/${auth.currentUser.uid}`),
            file
        );
        uploadTask.on(
            "state_changed",
            null,
            (error) => {
                console.error(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(
                    uploadTask.snapshot.ref
                );
                const formData = new FormData();
                formData.append("avatarURL", downloadURL);
                fetcher.submit(formData, {
                    method: "post",
                    action: "/update-avatar",
                });
            }
        );
    }
    return (
        <div className="p-1 border border-green-400">
            <label htmlFor="fileInput">Profile picture</label>
            <input
                style={styles}
                type="file"
                name="file"
                id="fileInput"
                onChange={handleFileUpload}
            />
        </div>
    );
}
