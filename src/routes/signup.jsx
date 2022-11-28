import { useState } from "react";
import { auth, database } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { Form, Link, redirect } from "react-router-dom";

export async function action({ request }) {
    const formData = await request.formData();
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
    await set(ref(database, `users/${uid}`), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        profile_picture: "",
        bio: "",
        twitter: "",
    });
    return redirect(`/edit`);
}

export default function Signup() {
    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: "",
    });
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <main className="p-6">
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
                    required
                />
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    className="border border-slate-500 block"
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    className="border border-slate-500 block"
                    value={passwords.password}
                    required
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
                    required
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
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                <button>Sign Up</button>
            </Form>
            <Link to="/login">Already have an account?</Link>
        </main>
    );
}
