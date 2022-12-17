import React from "react";
import ReactDOM from "react-dom/client";

import Login, { action as loginAction } from "./routes/login";
import Signup, { action as signupAction } from "./routes/signup";
import Profile, {
    loader as profileLoader,
    action as profileAction,
} from "./routes/profile";
import EditProfile, {
    loader as editProfileLoader,
    action as editProfileAction,
} from "./routes/editProfile";
import Account, {
    loader as accountLoader,
    action as accountAction,
} from "./routes/account";
import Root, { loader as rootLoader } from "./routes/root";
import Chat, {
    loader as chatLoader,
    action as chatAction,
} from "./routes/chat";
import { action as deleteMessageAction } from "./routes/deleteMessage";
import Search from "./routes/search";
import { action as signOutAction } from "./routes/signOut";
import ErrorPage from "./errorPage";
import Index from "./routes/index";

import "./index.css";

import {
    createBrowserRouter,
    RouterProvider,
    Route,
    createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
    createRoutesFromElements([
        <Route
            path="/"
            element={<Root />}
            loader={rootLoader}
            errorElement={<ErrorPage />}
        >
            <Route index element={<Index />} />
            <Route
                path="users/:userId"
                element={<Profile />}
                loader={profileLoader}
                action={profileAction}
            />
            <Route
                path="edit"
                element={<EditProfile />}
                loader={editProfileLoader}
                action={editProfileAction}
            />
            <Route
                path="account"
                element={<Account />}
                loader={accountLoader}
                action={accountAction}
            />
            <Route
                path="chats/:chatId"
                element={<Chat />}
                loader={chatLoader}
                action={chatAction}
            />
            <Route
                path="chats/:chatId/delete-message"
                action={deleteMessageAction}
            />
            <Route path="search" element={<Search />} loader={rootLoader} />
            <Route path="signOut" action={signOutAction} />
        </Route>,
        <Route path="login" element={<Login />} action={loginAction} />,
        <Route path="signup" element={<Signup />} action={signupAction} />,
    ])
);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
