import { IoLogoFacebook } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

export default function SignInPopup({
    fetcher,
    signInMethods,
    setSignInPopupOpen,
}) {
    const response = fetcher.data;
    const status = response?.status;
    const message = response?.message;
    if (fetcher.state === "idle" && status === "success") {
        setSignInPopupOpen(false);
    }
    return (
        <>
            {message && (
                <div>
                    <p>{message}</p>
                </div>
            )}
            <div>
                <button onClick={() => setSignInPopupOpen(false)}>X</button>
                <h3>Sign In Required</h3>
                <fetcher.Form method="post" action="/login">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        className="border border-slate-500 block"
                        defaultValue={auth.currentUser.email}
                        disabled
                    />
                    <input type="hidden" name="redirect" value="false" />
                    {signInMethods.includes("password") && (
                        <>
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
                        </>
                    )}
                    {signInMethods.includes("google.com") && (
                        <button
                            name="authProvider"
                            value="google"
                            className="bg-sky-100 border border-slate-700 flex items-center"
                        >
                            <FcGoogle />
                            <span>Continue with Google</span>
                        </button>
                    )}
                    {signInMethods.includes("facebook.com") && (
                        <button
                            name="authProvider"
                            value="facebook"
                            className="bg-sky-100 border border-slate-700 flex items-center"
                        >
                            <IoLogoFacebook />
                            <span>Continue with Facebook</span>
                        </button>
                    )}
                </fetcher.Form>
            </div>
        </>
    );
}
