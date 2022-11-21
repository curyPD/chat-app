import { useLoaderData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get, update } from "firebase/database";
import { updateProfile } from "firebase/auth";
import UpdateAvatar from "./updateAvatar";
import EditProfileForm from "../components/EditProfileForm";
// import UpdateSignInData from "./updateSignInData";

export async function action({ request }) {
    const formData = await request.formData();
    const profileInfo = Object.fromEntries(formData);
    const userSnapshot = await get(
        ref(database, `data/users/${auth.currentUser.uid}`)
    );
    const user = userSnapshot.val();
    const updates = {};
    updates[`data/users/${auth.currentUser.uid}/name`] = profileInfo.name;
    updates[`data/users/${auth.currentUser.uid}/twitter`] = profileInfo.twitter;
    updates[`data/users/${auth.currentUser.uid}/bio`] = profileInfo.bio;
    Object.values(user.chats).forEach((obj) => {
        updates[`data/chats/${obj.partner_uid}/${obj.chat_id}/partner_name`] =
            profileInfo.name;
    });
    return auth.currentUser.displayName !== profileInfo.name
        ? Promise.all(
              update(ref(database), updates),
              updateProfile(auth.currentUser, {
                  displayName: profileInfo.name,
              })
          )
        : update(ref(database), updates);
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

    return (
        <>
            <h1 className="text-2xl font-bold">Edit profile</h1>
            <UpdateAvatar />
            <EditProfileForm profileInfo={profileInfo} />
            {/* <UpdateSignInData profileInfo={profileInfo} /> */}
        </>
    );
}
