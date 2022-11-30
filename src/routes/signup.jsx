import { useState } from "react";
import { auth, database } from "../firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
} from "firebase/auth";
import { ref, set, update } from "firebase/database";
import { Form, Link, redirect, useActionData } from "react-router-dom";
import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { getAuthProviderObject } from "../helpers";

export async function action({ request }) {
    const formData = await request.formData();
    const error = {};
    try {
        if (formData.has("authProvider")) {
            console.log("Auth provider sign up");
            const authProvider = formData.get("authProvider");
            console.log(authProvider);
            const providerObject = getAuthProviderObject(authProvider);
            const userCredential = await signInWithPopup(auth, providerObject);
            const { user } = userCredential;
            const updates = {};
            updates[`users/${user.uid}/uid`] = user.uid;
            updates[`users/${user.uid}/name`] = user.displayName;
            updates[`users/${user.uid}/email`] = user.email;
            updates[`users/${user.uid}/profile_picture`] = user.photoURL;
            await update(ref(database), updates);
        } else {
            console.log("Password sign up");
            const userName = formData.get("name");
            const email = formData.get("email");
            const password = formData.get("password");
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const { user } = userCredential;
            await updateProfile(user, { displayName: userName });
            await set(ref(database, `users/${user.uid}`), {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                profile_picture: "",
                bio: "",
                twitter: "",
            });
        }
        return redirect(`/edit`);
    } catch (err) {
        console.error(err);
        if (
            err.code === "auth/email-already-in-use" ||
            err.code === "auth/account-exists-with-different-credential"
        ) {
            error.message =
                "There already exists an account with the given email address.";
        } else if (err.code === "auth/invalid-email") {
            error.message = "The email address is not valid.";
        } else if (err.code === "auth/weak-password") {
            error.message = "The password is too weak.";
        } else {
            error.message = "Failed to sign up. Please try again.";
        }
        return error;
    }
}

export default function Signup() {
    const error = useActionData();
    const message = error?.message;
    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: "",
    });
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <main className="p-6">
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            {errorMessage && (
                <div>
                    <p>{errorMessage}</p>
                </div>
            )}
            <Form
                method="post"
                onSubmit={(e) => {
                    setErrorMessage("");
                    if (passwords.password !== passwords.confirmPassword) {
                        e.preventDefault();
                        setErrorMessage("Passwords do not match");
                    }
                }}
            >
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    className="border border-slate-500 block"
                    // required
                />
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    className="border border-slate-500 block"
                    // required
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    className="border border-slate-500 block"
                    value={passwords.password}
                    // required
                    onChange={(e) => {
                        setPasswords((prevPasswords) => {
                            return {
                                ...prevPasswords,
                                password: e.target.value,
                            };
                        });
                    }}
                    autoComplete="new-password"
                />
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    className="border border-slate-500 block"
                    value={passwords.confirmPassword}
                    // required
                    onChange={(e) => {
                        setPasswords((prevPasswords) => {
                            return {
                                ...prevPasswords,
                                confirmPassword: e.target.value,
                            };
                        });
                    }}
                    autoComplete="new-password"
                />
                <button>Sign Up</button>
                <hr />
                <button
                    name="authProvider"
                    value="google"
                    className="bg-sky-100 border border-slate-700 flex items-center"
                >
                    <FcGoogle />
                    <span>Continue with Google</span>
                </button>
                <button
                    name="authProvider"
                    value="facebook"
                    className="bg-sky-100 border border-slate-700 flex items-center"
                >
                    <IoLogoFacebook />
                    <span>Continue with Facebook</span>
                </button>
            </Form>
            <Link to="/login">Already have an account?</Link>
        </main>
    );
}
