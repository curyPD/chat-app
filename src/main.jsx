import React from "react";
import ReactDOM from "react-dom/client";

import Login, { action as loginAction } from "./routes/login";
import Signup, { action as signupAction } from "./routes/signup";
import Profile from "./routes/profile";
import EditProfile from "./routes/editProfile";
import Root, { loader as rootLoader } from "./routes/root";
import Chat, { loader as chatLoader } from "./routes/chat";

import "./index.css";

import {
    createBrowserRouter,
    RouterProvider,
    Route,
    createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
    createRoutesFromElements([
        <Route path="/" element={<Root />} loader={rootLoader}>
            <Route path="users/:userId" element={<Profile />} />
            <Route path="users/:userId/edit" element={<EditProfile />} />
            <Route
                path="chats/:chatId"
                element={<Chat />}
                loader={chatLoader}
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
