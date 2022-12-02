import { useState, useEffect } from "react";
import { useFetcher, useActionData, useLoaderData } from "react-router-dom";
import { auth } from "../firebase";
import {
    fetchSignInMethodsForEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail,
    updatePassword,
} from "firebase/auth";

export async function action({ request }) {
    const formData = await request.formData();
    const error = {};
    try {
        if (formData.has("email")) {
            const email = formData.get("email");
            if (email === auth.currentUser.email) return;
            await updateEmail(auth.currentUser, email);
        } else if (formData.has("oldPassword")) {
            const oldPassword = formData.get("oldPassword");
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                oldPassword
            );
            await reauthenticateWithCredential(auth.currentUser, credential);
            const newPassword = formData.get("newPassword");
            await updatePassword(auth.currentUser, newPassword);
            console.log("UPDATED");
        }
    } catch (err) {
        console.error(err);
    }
}

export async function loader() {
    const { currentUser } = auth;
    if (!currentUser) return {};
    const { email } = currentUser;
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return { signInMethods };
}

export default function Account() {
    const { signInMethods } = useLoaderData();
    const fetcher = useFetcher();
    const [allowEditEmail, setAllowEditEmail] = useState(false);
    const [allowEditPassword, setAllowEditPassword] = useState(false);
    const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);
    const [passwordPopupMessage, setPasswordPopupMessage] = useState("");
    const [popupPassword, setPopupPassword] = useState("");

    async function reauthenticate(e) {
        try {
            e.preventDefault();
            setPasswordPopupMessage("");
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                popupPassword
            );
            await reauthenticateWithCredential(auth.currentUser, credential);
            setPopupPassword("");
            setAllowEditEmail(true);
            setPasswordPopupOpen(false);
        } catch (err) {
            console.log(err);
            setPasswordPopupMessage("Wrong password");
        }
    }

    return (
        <>
            {passwordPopupOpen && (
                <div className="bg-red-100">
                    <p>Password required</p>
                    <p>{auth.currentUser.email}</p>
                    <form onSubmit={reauthenticate}>
                        <input
                            type="password"
                            value={popupPassword}
                            onChange={(e) => setPopupPassword(e.target.value)}
                            required
                        />
                        {passwordPopupMessage && <p>{passwordPopupMessage}</p>}
                        <button>Confirm</button>
                        <button
                            type="button"
                            onClick={() => setPasswordPopupOpen(false)}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}
            {allowEditEmail ? (
                <fetcher.Form
                    method="post"
                    onSubmit={() => setAllowEditEmail(false)}
                >
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        defaultValue={auth.currentUser.email}
                        name="email"
                        id="email"
                    />
                    <button>Confirm</button>
                </fetcher.Form>
            ) : (
                <div>
                    <h4>Email</h4>
                    <p>{auth.currentUser.email}</p>
                    <button onClick={() => setPasswordPopupOpen(true)}>
                        Edit email
                    </button>
                </div>
            )}
            {allowEditPassword ? (
                <fetcher.Form method="post">
                    <label htmlFor="oldPassword">Old Password</label>
                    <input
                        type="password"
                        name="oldPassword"
                        autoComplete="current-password"
                    />
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        autoComplete="new-password"
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                    />
                    <button>Confirm</button>
                </fetcher.Form>
            ) : (
                <div>
                    <h4>Password</h4>
                    <button onClick={() => setAllowEditPassword(true)}>
                        Update Password
                    </button>
                </div>
            )}
        </>
    );
}
