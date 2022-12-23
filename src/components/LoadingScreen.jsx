import logo from "../assets/logo.png";

export default function LoadingScreen() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 dark:bg-custom-gradient-dark">
            <img
                src={logo}
                alt="Logo"
                className="h-8 w-8 shrink-0 dark:drop-shadow-lg"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400">
                Loading...
            </span>
        </div>
    );
}
