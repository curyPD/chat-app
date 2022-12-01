import { useLoaderData, useFetcher, useActionData } from "react-router-dom";
import { auth, database, storage } from "../firebase";
import { ref, get, update } from "firebase/database";
import { updateProfile } from "firebase/auth";
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

export async function action({ request }) {
    const formData = await request.formData();
    const error = {};
    try {
        if (formData.has("avatarURL")) {
            console.log("Update avatar");
            const photoURL = formData.get("avatarURL");
            const userSnapshot = await get(
                ref(database, `data/users/${auth.currentUser.uid}`)
            );
            const user = userSnapshot.val();
            const updates = {};
            updates[`data/users/${auth.currentUser.uid}/profile_picture`] =
                photoURL;
            user.chats &&
                Object.values(user.chats).forEach((obj) => {
                    updates[
                        `data/chats/${obj.partner_uid}/${obj.chat_id}/partner_profile_picture`
                    ] = photoURL;
                });
            return Promise.all([
                update(ref(database), updates),
                updateProfile(auth.currentUser, {
                    photoURL,
                }),
            ]);
        } else {
            const profileInfo = Object.fromEntries(formData);
            if (profileInfo.name === "") {
                error.nameIsEmpty = true;
                error.message = "Please fill out the name field.";
                return error;
            }
            const userSnapshot = await get(
                ref(database, `data/users/${auth.currentUser.uid}`)
            );
            const user = userSnapshot.val();
            const updates = {};
            updates[`data/users/${auth.currentUser.uid}/name`] =
                profileInfo.name;
            updates[`data/users/${auth.currentUser.uid}/twitter`] =
                profileInfo.twitter;
            updates[`data/users/${auth.currentUser.uid}/bio`] = profileInfo.bio;
            user.chats &&
                Object.values(user.chats).forEach((obj) => {
                    updates[
                        `data/chats/${obj.partner_uid}/${obj.chat_id}/partner_name`
                    ] = profileInfo.name;
                });
            return auth.currentUser.displayName !== profileInfo.name
                ? Promise.all([
                      update(ref(database), updates),
                      updateProfile(auth.currentUser, {
                          displayName: profileInfo.name,
                      }),
                  ])
                : update(ref(database), updates);
        }
    } catch (err) {
        console.error(err);
    }
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
    const error = useActionData();
    const message = error?.message;
    const nameIsEmpty = error?.nameIsEmpty;
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
                });
            }
        );
    }

    return (
        <>
            <h1 className="text-2xl font-bold">Edit profile</h1>
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
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
            <fetcher.Form method="post">
                <label htmlFor="nameInput">Change name</label>
                <input
                    className={
                        nameIsEmpty
                            ? "border border-pink-500 block"
                            : "border border-slate-500 block"
                    }
                    type="text"
                    defaultValue={profileInfo.name}
                    name="name"
                    id="nameInput"
                />
                <label htmlFor="bio">Bio</label>
                <textarea
                    name="bio"
                    id="bio"
                    cols="30"
                    rows="10"
                    className="border border-slate-500 block"
                    defaultValue={profileInfo.bio}
                />

                <label htmlFor="twitterInput">Twitter username</label>
                <input
                    className="border border-slate-500 block"
                    type="text"
                    defaultValue={profileInfo.twitter}
                    name="twitter"
                    id="twitterInput"
                />
                <button className="block border border-sky-500">Submit</button>
            </fetcher.Form>
        </>
    );
}
