import { useLoaderData, useFetcher, useActionData } from "react-router-dom";
import { auth, database, storage } from "../firebase";
import { ref, get, update } from "firebase/database";
import { updateProfile } from "firebase/auth";
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import { HiOutlineUser } from "react-icons/hi2";
import ProfilePictureSelect from "../components/ProfilePictureSelect";

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
    const fetcher = useFetcher();
    const response = fetcher.data;
    const message = response?.message;
    const nameIsEmpty = response?.nameIsEmpty;

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
        <div className="h-full overflow-y-auto bg-custom-gradient pb-12 pt-24 md:pb-0">
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            <main className="relative mx-auto min-h-full max-w-lg rounded-t-3xl border border-slate-200 bg-white/50 px-6 pb-8 backdrop-blur-md">
                <div className="mx-auto min-h-full max-w-md">
                    {profileInfo?.profile_picture ? (
                        <div className="absolute top-0 left-1/2 z-10 -translate-y-1/2 -translate-x-1/2 overflow-hidden rounded-full border-4 border-white bg-slate-100">
                            <img
                                src={profileInfo?.profile_picture}
                                alt={profileInfo?.name}
                                className="h-24 w-24 rounded-full object-cover"
                            />
                            <ProfilePictureSelect
                                styles={styles}
                                handleFileUpload={handleFileUpload}
                            />
                        </div>
                    ) : (
                        <div className="absolute top-0 left-1/2 z-10 flex h-24 w-24 -translate-y-1/2 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100">
                            <HiOutlineUser className="h-12 w-12 text-slate-400" />
                            <ProfilePictureSelect
                                styles={styles}
                                handleFileUpload={handleFileUpload}
                            />
                        </div>
                    )}

                    <fetcher.Form method="post" className="mt-16 block">
                        <label
                            htmlFor="nameInput"
                            className="mb-1 inline-block text-xs font-medium text-slate-700"
                        >
                            Name
                        </label>
                        <input
                            className={`mb-4 block w-full rounded-md border focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 ${
                                nameIsEmpty
                                    ? "border-pink-500"
                                    : "border-slate-300"
                            } bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm`}
                            type="text"
                            defaultValue={profileInfo?.name}
                            name="name"
                            id="nameInput"
                        />
                        <label
                            htmlFor="bio"
                            className="mb-1 inline-block text-xs font-medium text-slate-700"
                        >
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            id="bio"
                            cols="30"
                            rows="10"
                            className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300"
                            defaultValue={profileInfo?.bio}
                        />

                        <label
                            htmlFor="twitterInput"
                            className="mb-1 inline-block text-xs font-medium text-slate-700"
                        >
                            Twitter username
                        </label>
                        <input
                            className="mb-5 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300"
                            type="text"
                            defaultValue={profileInfo?.twitter}
                            name="twitter"
                            id="twitterInput"
                        />
                        <button className="block w-full rounded-md bg-sky-500 py-2 px-4 text-center text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                            Submit
                        </button>
                    </fetcher.Form>
                </div>
            </main>
        </div>
    );
}
