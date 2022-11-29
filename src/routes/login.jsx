import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    linkWithCredential,
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
        return redirect("/");
    } catch (err) {
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
        }
    }
}

export default function Login() {
    const error = useActionData();
    const providerToken = error?.providerToken;
    const providerId = error?.providerId;
    const signInMethods = error?.signInMethods;
    return (
        <main className="p-6">
            {signInMethods && (
                <div>
                    Please sign in using{" "}
                    {signInMethods.length > 1
                        ? "one of the methods"
                        : "the method"}{" "}
                    you've used before:{" "}
                    {signInMethods.map((method, i, arr) => (
                        <span key={i}>
                            {method}
                            {i === arr.length - 1 ? "" : ","}
                        </span>
                    ))}
                    . We'll link {providerId} to your account automatically.
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
                    <input
                        type="hidden"
                        name="providerToken"
                        value={providerToken}
                    />
                )}
                {providerId && (
                    <input type="hidden" name="providerId" value={providerId} />
                )}
            </Form>
            <Link to="/signup">Don't have an account yet?</Link>
        </main>
    );
}
