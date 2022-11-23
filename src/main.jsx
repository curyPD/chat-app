import React from "react";
import ReactDOM from "react-dom/client";

import Login, { action as loginAction } from "./routes/login";
import Signup, { action as signupAction } from "./routes/signup";
import Profile, { loader as profileLoader } from "./routes/profile";
import EditProfile, {
    loader as editProfileLoader,
    action as editProfileAction,
} from "./routes/editProfile";
import Root from "./routes/root";
import Chat, {
    loader as chatLoader,
    action as chatAction,
} from "./routes/chat";
import { action as updateAvatarAction } from "./routes/updateAvatar";
import { action as updateSignInDataAction } from "./routes/updateSignInData";
import { action as deleteMessageAction } from "./routes/deleteMessage";

import "./index.css";

import {
    createBrowserRouter,
    RouterProvider,
    Route,
    createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
    createRoutesFromElements([
        <Route path="/" element={<Root />}>
            <Route
                path="users/:userId"
                element={<Profile />}
                loader={profileLoader}
            />
            <Route
                path="edit"
                element={<EditProfile />}
                loader={editProfileLoader}
                action={editProfileAction}
            />
            <Route path="edit/update-avatar" action={updateAvatarAction} />
            <Route
                path="edit/update-signin-data"
                action={updateSignInDataAction}
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
