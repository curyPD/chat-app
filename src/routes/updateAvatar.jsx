import { auth, database } from "../firebase";
import { updateProfile } from "firebase/auth";
import { ref, get, update } from "firebase/database";

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
    Object.values(user.chats).forEach((obj) => {
        updates[
            `data/chats/${obj.partner_uid}/${obj.chat_id}/partner_profile_picture`
        ] = photoURL;
    });
    return Promise.all(
        update(ref(database), updates),
        updateProfile(auth.currentUser, {
            photoURL,
        })
    );
}
