import { useEffect, useState } from "react";
import {
    useLoaderData,
    useActionData,
    Form,
    redirect,
    useSubmit,
} from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get, update } from "firebase/database";
import { updateProfile } from "firebase/auth";
import { HiOutlineUser } from "react-icons/hi2";
import ProfilePictureSelect from "../components/ProfilePictureSelect";
import { handleAvatarUpload } from "../helpers";

export async function action({ request }) {
    const formData = await request.formData();
    const response = {};
    try {
        if (formData.has("avatarSm") && formData.has("avatarLg")) {
            console.log("Update avatar");
            const avatarSm = formData.get("avatarSm");
            const avatarLg = formData.get("avatarLg");
            const userSnapshot = await get(
                ref(database, `users/${auth.currentUser.uid}`)
            );
            const user = userSnapshot.val();
            const updates = {};
            updates[`users/${auth.currentUser.uid}/profile_picture`] = avatarLg;
            updates[`users/${auth.currentUser.uid}/profile_picture_sm`] =
                avatarSm;
            user.chats &&
                Object.values(user.chats).forEach((obj) => {
                    updates[
                        `chats/${obj.partner_uid}/${obj.chat_id}/partner_profile_picture`
                    ] = avatarSm;
                });
            await Promise.all([
                update(ref(database), updates),
                updateProfile(auth.currentUser, {
                    photoURL: avatarLg,
                }),
            ]);
            response.message = "Profile picture updated successfully.";
            return response;
        } else {
            const profileInfo = Object.fromEntries(formData);
            if (profileInfo.name === "") {
                response.nameIsEmpty = true;
                response.error = "Please fill out the name field.";
                return response;
            }
            const userSnapshot = await get(
                ref(database, `users/${auth.currentUser.uid}`)
            );
            const user = userSnapshot.val();
            const updates = {};
            updates[`users/${auth.currentUser.uid}/name`] = profileInfo.name;
            updates[`users/${auth.currentUser.uid}/twitter`] =
                profileInfo.twitter;
            updates[`users/${auth.currentUser.uid}/bio`] = profileInfo.bio;
            user.chats &&
                Object.values(user.chats).forEach((obj) => {
                    updates[
                        `chats/${obj.partner_uid}/${obj.chat_id}/partner_name`
                    ] = profileInfo.name;
                });
            await Promise.all([
                update(ref(database), updates),
                updateProfile(auth.currentUser, {
                    displayName: profileInfo.name,
                }),
            ]);
            return redirect(`/users/${auth.currentUser.uid}`);
        }
    } catch (err) {
        console.error(err);
        response.error = "Couldn't update profile. Please try again.";
        return response;
    }
}

export async function loader() {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { uid } = currentUser;
    const snapshot = await get(ref(database, `users/${uid}`));
    if (!snapshot.exists())
        throw new Response("No user information found", { status: 404 });
    return { profileInfo: snapshot.val() };
}

export default function EditProfile() {
    const { profileInfo } = useLoaderData();
    const response = useActionData();
    const message = response?.message;
    const nameIsEmpty = response?.nameIsEmpty;
    const submit = useSubmit();
    const [error, setError] = useState(response?.error);

    useEffect(() => {
        return setError(response?.error);
    }, [response?.error]);

    const styles = {
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        overflow: "hidden",
        position: "absolute",
        whiteSpace: "nowrap",
        width: "1px",
    };

    return (
        <div className="h-screen overflow-y-auto bg-custom-gradient pb-12 pt-24 dark:bg-custom-gradient-dark md:pb-0 lg:h-full lg:bg-none lg:pt-0 lg:dark:bg-none">
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            {error && (
                <div>
                    <p>{error}</p>
                </div>
            )}
            <main className="relative mx-auto min-h-full max-w-lg rounded-t-3xl border border-slate-200 bg-white/50 px-6 pb-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:mx-0 lg:h-full lg:min-h-0 lg:max-w-none lg:overflow-y-auto lg:rounded-2xl lg:px-8 lg:pt-6">
                {profileInfo?.profile_picture ? (
                    <div className="absolute top-0 left-0 z-10 -translate-y-1/2 translate-x-6 overflow-hidden rounded-full border-4 border-white dark:border-slate-900 lg:translate-y-6 lg:border-transparent">
                        <img
                            src={profileInfo?.profile_picture}
                            alt={profileInfo?.name}
                            className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                        />
                        <ProfilePictureSelect
                            styles={styles}
                            handleFileUpload={(e) =>
                                handleAvatarUpload(e, submit, setError)
                            }
                        />
                    </div>
                ) : (
                    <div className="absolute top-0  left-0 flex h-24 w-24 -translate-y-1/2 translate-x-6 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 dark:border-slate-900 dark:bg-slate-800 sm:h-28 sm:w-28 lg:translate-y-6 lg:border-transparent">
                        <HiOutlineUser className="h-10 w-10 text-slate-400 dark:text-slate-500 sm:h-12 sm:w-12 lg:h-12 lg:w-12" />
                        <ProfilePictureSelect
                            styles={styles}
                            handleFileUpload={(e) =>
                                handleAvatarUpload(e, submit, setError)
                            }
                        />
                    </div>
                )}

                <Form method="post" className="mt-20 block sm:mt-24 lg:mt-36">
                    <label
                        htmlFor="nameInput"
                        className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                    >
                        Name
                    </label>
                    <input
                        className={`mb-4 block w-full rounded-md border focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 ${
                            nameIsEmpty
                                ? "border-pink-500 dark:border-pink-500"
                                : "border-slate-300 dark:border-slate-700"
                        } bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm`}
                        type="text"
                        defaultValue={profileInfo?.name}
                        name="name"
                        id="nameInput"
                    />
                    <label
                        htmlFor="bio"
                        className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                    >
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        id="bio"
                        cols="30"
                        rows="10"
                        className="mb-4 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                        defaultValue={profileInfo?.bio}
                    />

                    <label
                        htmlFor="twitterInput"
                        className="mb-1 inline-block text-xs font-medium text-slate-700 dark:text-slate-500 lg:text-sm"
                    >
                        Twitter username
                    </label>
                    <input
                        className="mb-5 block w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:py-2 lg:px-3 lg:text-sm"
                        type="text"
                        defaultValue={profileInfo?.twitter}
                        name="twitter"
                        id="twitterInput"
                    />
                    <button className="block w-full rounded-md bg-sky-500 py-2 px-4 text-center text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:px-5 lg:text-sm">
                        Submit
                    </button>
                </Form>
            </main>
        </div>
    );
}
