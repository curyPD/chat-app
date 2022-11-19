import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";

export async function action({ request }) {
    const formData = await request.formData();
    const photoURL = formData.get("avatarURL");
    console.log(photoURL);
    // updateProfile(auth.currentUser, {
    //     photoURL
    // })
}
