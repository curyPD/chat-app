import { useFetcher } from "react-router-dom";

export async function action({ request }) {}

export default function UpdateSignInData({ profileInfo }) {
    const fetcher = useFetcher();
    return (
        <fetcher.Form method="post" action="/update-signin-data">
            <label htmlFor="emailInput">Change email</label>
            <input
                className="border border-slate-500 block"
                type="email"
                defaultValue={profileInfo.email}
                name="email"
                id="emailInput"
            />
            <label htmlFor="passwordInput">Change password</label>
            <input
                className="border border-slate-500 block"
                type="password"
                name="password"
                id="passwordInput"
                autoComplete="new-password"
            />
            <button className="block border border-sky-500" type="submit">
                Submit
            </button>
        </fetcher.Form>
    );
}
