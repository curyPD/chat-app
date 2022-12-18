import logo from "../assets/logo.png";

export default function NoMessagesScreen() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 lg:h-no-messages-screen">
            <img src={logo} alt="Logo" className="h-8 w-8 shrink-0" />
            <span className="text-sm text-slate-500">No messages yet...</span>
        </div>
    );
}
