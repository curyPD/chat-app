import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router-dom";
import { auth } from "../firebase";
import {
    fetchSignInMethodsForEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail,
    updatePassword,
} from "firebase/auth";
import SignInPopup from "../components/SignInPopup";

export async function action({ request }) {
    const formData = await request.formData();
    const response = {};
    try {
        if (formData.has("newEmail")) {
            const newEmail = formData.get("newEmail");
            if (newEmail === auth.currentUser.email) return;
            await updateEmail(auth.currentUser, email);
            response.message = "Email successfully updated🎉";
            return response;
        } else if (formData.has("oldPassword")) {
            const oldPassword = formData.get("oldPassword");
            const newPassword = formData.get("newPassword");
            const confirmPassword = formData.get("confirmPassword");
            if (newPassword !== confirmPassword) {
                response.incorrectFields = ["confirmPassword", "newPassword"];
                response.error = "Passwords do not match.";
                return response;
            }
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                oldPassword
            );
            const userCredential = await reauthenticateWithCredential(
                auth.currentUser,
                credential
            );
            await updatePassword(userCredential.user, newPassword);
            response.message = "Password successfully updated🎉";
            return response;
        }
    } catch (err) {
        console.error(err, err.code);
        if (err.code === "auth/invalid-email") {
            response.error = "The email you used is invalid.";
        } else if (err.code === "auth/email-already-in-use") {
            response.error = "The email is already used by another user.";
        } else if (err.code === "auth/requires-recent-login") {
            response.error =
                "Please sign in again in order to update your email.";
            response.displaySignInPopup = true;
        } else if (
            err.code === "auth/wrong-password" ||
            err.code === "auth/invalid-credential" ||
            err.code === "auth/user-mismatch"
        ) {
            response.error = "Incorrect password. Please try again.";
        } else if (err.code === "auth/weak-password") {
            response.error = "The new password is not strong enough.";
        }
        return response;
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

    const response = fetcher.data;
    const message = response?.message;
    const error = response?.error;
    const displaySignInPopup = response?.displaySignInPopup;

    const [allowEditEmail, setAllowEditEmail] = useState(false);
    const [allowEditPassword, setAllowEditPassword] = useState(false);
    const [signInPopupOpen, setSignInPopupOpen] = useState(
        displaySignInPopup || false
    );

    return (
        <>
            {error && (
                <div>
                    <p>{error}</p>
                </div>
            )}
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}

            {signInPopupOpen && (
                <SignInPopup
                    fetcher={fetcher}
                    signInMethods={signInMethods}
                    setSignInPopupOpen={setSignInPopupOpen}
                />
            )}

            <fetcher.Form method="post">
                <label htmlFor="newEmail">Email</label>
                <input
                    type="email"
                    defaultValue={auth.currentUser.email}
                    name="newEmail"
                    id="newEmail"
                    disabled={!allowEditEmail}
                />
                {!allowEditEmail ? (
                    <button
                        type="button"
                        onClick={() => setAllowEditEmail(true)}
                    >
                        Edit email
                    </button>
                ) : (
                    <div>
                        <button>Submit</button>
                        <button
                            type="button"
                            onClick={() => setAllowEditEmail(false)}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </fetcher.Form>

            {signInMethods.includes("password") && (
                <div>
                    {allowEditPassword ? (
                        <fetcher.Form method="post">
                            <label htmlFor="oldPassword">Old Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                autoComplete="current-password"
                                required
                            />
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                autoComplete="new-password"
                                required
                            />
                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                required
                            />
                            <div>
                                <button>Confirm</button>
                                <button
                                    type="button"
                                    onClick={() => setAllowEditPassword(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </fetcher.Form>
                    ) : (
                        <div>
                            <h4>Password</h4>
                            <button onClick={() => setAllowEditPassword(true)}>
                                Update Password
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
