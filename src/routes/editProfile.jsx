import { useLoaderData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get } from "firebase/database";
import { HiOutlineUserCircle } from "react-icons/hi";

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
    return <h1>Edit page</h1>;
}
