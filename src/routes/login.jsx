import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    linkWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { Form, Link, redirect, useActionData } from "react-router-dom";
import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import {
    getAuthProviderObject,
    getAuthToken,
    getProviderId,
    getAuthCredential,
} from "../helpers";

export async function action({ request }) {
    const formData = await request.formData();
    const error = {};
    let user;
    try {
        if (formData.has("authProvider")) {
            console.log("Auth provider sign in");
            const authProvider = formData.get("authProvider");
            console.log(authProvider);
            const providerObject = getAuthProviderObject(authProvider);
            const userCredential = await signInWithPopup(auth, providerObject);
            user = userCredential.user;
        } else {
            console.log("Password sign in");
            const email = formData.get("email");
            const password = formData.get("password");
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            user = userCredential.user;
        }
        if (formData.has("providerToken")) {
            console.log("Second try");
            const providerToken = formData.get("providerToken");
            const providerId = formData.get("providerId");
            const credential = getAuthCredential(providerId, providerToken);
            const userCredential = await linkWithCredential(user, credential);
            console.log(userCredential);
        }
        if (formData.has("newPassword")) {
            console.log("Second try");
            const newPassword = formData.get("newPassword");
            const email = user.email;
            const credential = EmailAuthProvider.credential(email, newPassword);
            const userCredential = await linkWithCredential(user, credential);
            console.log(userCredential);
        }
        return redirect("/");
    } catch (err) {
        console.error(err);
        if (
            formData.has("authProvider") &&
            err.code === "auth/account-exists-with-different-credential"
        ) {
            const authProvider = formData.get("authProvider");
            error.providerToken = getAuthToken(authProvider, err);
            error.providerId = getProviderId(authProvider, err);
            const signInMethods = await fetchSignInMethodsForEmail(
                auth,
                err.customData.email
            );
            error.signInMethods = signInMethods;
            return error;
        } else if (err.code === "auth/wrong-password") {
            const signInMethods = await fetchSignInMethodsForEmail(
                auth,
                err.customData.email
            );
            if (signInMethods.includes("password")) {
                error.message = "Incorrect password. Please try again.";
                return error;
            }
            const password = formData.get("password");
            error.newPassword = password;
            error.signInMethods = signInMethods;
            return error;
        } else if (
            err.code !== "auth/account-exists-with-different-credential"
        ) {
            error.message = "Failed to log in. Please try again.";
            return error;
        }
    }
}

export default function Login() {
    const error = useActionData();
    const providerToken = error?.providerToken;
    const providerId = error?.providerId;
    const newPassword = error?.newPassword;
    const signInMethods = error?.signInMethods;
    const message = error?.message;
    return (
        <main className="p-6">
            {signInMethods && (
                <div>
                    Please sign in using{" "}
                    {signInMethods.length > 1
                        ? "one of the methods"
                        : "the method"}{" "}
                    you've used before:{" "}
                    {signInMethods.map(
                        (method, i, arr) =>
                            `${method}${i === arr.length - 1 ? "" : ","}`
                    )}
                    . We'll link{" "}
                    {providerId ? providerId : "the password you entered"} to
                    your account automatically.{" "}
                    {newPassword &&
                        "You'll be able to change it later on your profile page."}
                </div>
            )}
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            <Form method="post">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    className="border border-slate-500 block"
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    className="border border-slate-500 block"
                    autoComplete="current-password"
                />
                <button>Log In</button>
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
                {providerToken && (
                    <>
                        <input
                            type="hidden"
                            name="providerToken"
                            value={providerToken}
                        />
                        <input
                            type="hidden"
                            name="providerId"
                            value={providerId}
                        />
                    </>
                )}
                {newPassword && (
                    <input
                        type="hidden"
                        name="newPassword"
                        value={newPassword}
                    />
                )}
            </Form>
            <Link to="/signup">Don't have an account yet?</Link>
        </main>
    );
}
