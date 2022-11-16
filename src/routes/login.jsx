import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Form, Link, redirect } from "react-router-dom";

export async function action({ request }) {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    await signInWithEmailAndPassword(auth, email, password);
    return redirect("/menu");
}

export default function Login() {
    return (
        <main className="p-6">
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
            </Form>
            <Link to="/signup">Don't have an account yet?</Link>
        </main>
    );
}
