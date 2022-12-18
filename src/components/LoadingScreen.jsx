import logo from "../assets/logo.png"

export default function LoadingScreen() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <img src={logo} alt="Logo" className="h-8 w-8 shrink-0" />
            <span className="text-sm text-slate-500">Loading...</span>
        </div>
    )
}