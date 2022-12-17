import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export async function action() {
    try {
        return await signOut(auth);
    } catch (err) {
        console.error(err);
    }
}
