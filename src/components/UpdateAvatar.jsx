import { auth, storage } from "../firebase";
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import { useFormAction } from "react-router-dom";

export default function UpdateAvatar({ fetcher }) {
    const updateAvatarPath = useFormAction("update-avatar");

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
                    action: updateAvatarPath,
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
