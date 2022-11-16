import React from "react";
import ReactDOM from "react-dom/client";

import Root from "./routes/root";
import Login, { action as loginAction } from "./routes/login";
import Signup, { action as signupAction } from "./routes/signup";
import Profile from "./routes/profile";
import EditProfile from "./routes/editProfile";
import Menu from "./routes/menu";

import "./index.css";

import {
    createBrowserRouter,
    RouterProvider,
    Route,
    createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
    createRoutesFromElements([
        <Route path="/" element={<Root />} />,
        <Route path="login" element={<Login />} action={loginAction} />,
        <Route path="signup" element={<Signup />} action={signupAction} />,
        <Route path="menu" element={<Menu />}>
            <Route path="users/:userId" element={<Profile />} />
            <Route path="users/:userId/edit" element={<EditProfile />} />
        </Route>,
    ])
);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
