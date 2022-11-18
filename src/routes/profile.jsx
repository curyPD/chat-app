import { Form, useLoaderData } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get } from "firebase/database";
import { HiOutlineUserCircle } from "react-icons/hi";

export async function loader({ params }) {
    const snapshot = await get(ref(database, `data/users/${params.userId}`));
    if (!snapshot.exists()) throw new Error("No user found");
    return { profileInfo: snapshot.val() };
}

export default function Profile() {
    const { profileInfo } = useLoaderData();
    return (
        <>
            <h1>{profileInfo.name}'s profile</h1>
            <div>
                {profileInfo.photo_url ? (
                    <img src={profileInfo.photo_url} alt={profileInfo.name} />
                ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-sky-400 flex items-center justify-center">
                        <HiOutlineUserCircle className="h-12 w-12" />
                    </div>
                )}
            </div>
            {profileInfo.uid === auth.currentUser.uid && (
                <Form action="edit">
                    <button>Edit profile</button>
                </Form>
            )}
        </>
    );
}
