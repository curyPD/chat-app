import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { auth, database } from "../firebase";
import { onChildAdded, ref } from "firebase/database";

export default function Menu() {
    return (
        <main className="h-screen grid grid-cols-[350px_1fr]">
            <div className="bg-red-100"></div>
            <div className="bg-green-100">
                <Outlet />
            </div>
        </main>
    );
}
