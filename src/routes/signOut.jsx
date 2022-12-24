import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export async function action() {
    const response = {};
    try {
        return await signOut(auth);
    } catch (err) {
        response.error = "Couldn't sign out. Please try again later.";
        return response;
    }
}
