import { useRef, useEffect } from "react";
import { useLoaderData, Form } from "react-router-dom";
import UserLink from "../components/UserLink";

export default function Search() {
    const response = useLoaderData();
    const users = response?.users;
    const searchTerm = response?.searchTerm;
    const userSearchFieldRef = useRef(null);

    useEffect(() => {
        if (userSearchFieldRef.current)
            userSearchFieldRef.current.value = searchTerm;
    }, [searchTerm]);

    const userElements = users?.map((user, i) => (
        <UserLink
            key={i}
            id={user.uid}
            name={user.name}
            photoURL={user.photo_url}
        />
    ));
    return (
        <div>
            <Form action={location.pathname}>
                <input
                    type="text"
                    name="q"
                    onChange={(e) => {
                        submit(e.currentTarget.form);
                    }}
                    ref={userSearchFieldRef}
                    defaultValue={searchTerm}
                />
            </Form>
            {userElements && <div>{userElements}</div>}
        </div>
    );
}
