import { Form, useLoaderData, useNavigate } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, get } from "firebase/database";
import UpdateAvatar from "./updateAvatar";

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
            <UpdateAvatar />
        </>
    );
}
