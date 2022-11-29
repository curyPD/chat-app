import { Form } from "react-router-dom";

export default function AuthProviderSignInBtn({ children, provider }) {
    return (
        <Form method="post">
            <button name="authProvider" value={provider}>
                {children}
                <span>
                    Continue with{" "}
                    {provider[0].toUpperCase() + provider.slice(1)}
                </span>
            </button>
        </Form>
    );
}
