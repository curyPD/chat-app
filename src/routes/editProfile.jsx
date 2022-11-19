import { Form, useLoaderData, useNavigate, useFetcher } from "react-router-dom";
import { auth, database, storage } from "../firebase";
import { ref, get } from "firebase/database";
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

export async function action({ request }) {
    const formData = await request.formData();
    console.log(Object.fromEntries(formData));
}

export async function loader() {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { uid } = currentUser;
    const snapshot = await get(ref(database, `data/users/${uid}`));
    if (!snapshot.exists())
        throw new Response("No user information found", { status: 404 });
    return { profileInfo: snapshot.val() };
}

export default function EditProfile() {
    const { profileInfo } = useLoaderData();
    const navigate = useNavigate();
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
                    action: "/update",
                });
            }
        );
    }

    return (
        <>
            <h1>Edit profile</h1>
            <Form method="post">
                <label htmlFor="nameInput">Change name</label>
                <input
                    className="border border-slate-500 block"
                    type="text"
                    defaultValue={profileInfo.name}
                    name="name"
                    id="nameInput"
                />
                <label htmlFor="twitterInput">Twitter username</label>
                <input
                    className="border border-slate-500 block"
                    type="text"
                    defaultValue={profileInfo.twitter}
                    name="twitter"
                    id="twitterInput"
                />
                <button className="block border border-sky-500" type="submit">
                    Submit
                </button>
                <button type="button" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </Form>
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
        </>
    );
}
