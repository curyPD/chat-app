export default function Overlay({ children, onClick }) {
    return (
        <div
            className="fixed top-0 left-0 z-20 h-screen w-screen bg-black/60"
            onClick={onClick}
        >
            {children}
        </div>
    );
}
