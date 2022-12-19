import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Form, Link, useActionData } from "react-router-dom";
import logo from "../assets/logo.png";

export async function action({ request }) {
    const formData = await request.formData();
    const response = {};
    try {
        const email = formData.get("email");
        if (!email) {
            response.incorrectFields = "email";
            response.error = "Please enter your email.";
            return response;
        }
        await sendPasswordResetEmail(auth, email);
        response.message = "Check your inbox for further instructions.";
        return response;
    } catch (err) {
        console.error(err);
        if (err.code === "auth/invalid-email")
            response.error = "The email address is not valid.";
        else if (err.code === "auth/user-not-found")
            response.error =
                "There is no user corresponding to the email address.";
        else response.error = "Something went wrong. Please try again.";
        return response;
    }
}

export default function ForgotPassword() {
    const response = useActionData();
    const error = response?.error;
    const message = response?.message;
    const incorrectFields = response?.incorrectFields;

    return (
        <main className="relative h-screen overflow-y-auto bg-custom-gradient py-16 md:py-20">
            <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/50 px-8 py-6 backdrop-blur-md md:max-w-lg md:px-12 lg:py-8">
                <div className="mb-8 lg:mb-6">
                    <img
                        src={logo}
                        alt="Logo"
                        className="mx-auto block h-10 w-10 lg:mx-0"
                    />
                </div>
                <h1 className="mb-6 text-center text-lg font-bold text-slate-800 lg:mb-9 lg:text-left lg:text-xl">
                    Reset password
                </h1>
                <Form method="post">
                    <label
                        className="mb-1 block text-xs font-medium text-slate-700 lg:text-sm"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        className={`mb-4 block w-full rounded-md border ${
                            incorrectFields
                                ? "border-pink-500"
                                : " border-slate-300"
                        } bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm invalid:border-pink-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 lg:py-2 lg:px-3 lg:text-sm`}
                    />

                    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-0">
                        <button className="w-full rounded-md bg-sky-500 py-2 px-4 text-xs font-semibold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:w-auto lg:px-5 lg:text-base">
                            Reset password
                        </button>
                        <Link
                            to="/login"
                            className="rounded-sm text-xs text-sky-500 underline underline-offset-2 hover:no-underline focus:no-underline focus:outline-none lg:text-sm"
                        >
                            Log In
                        </Link>
                    </div>
                </Form>
            </section>

            {error && (
                <div className="absolute">
                    <p>{error}</p>
                </div>
            )}
            {message && (
                <div className="absolute">
                    <p>{message}</p>
                </div>
            )}
        </main>
    );
}
