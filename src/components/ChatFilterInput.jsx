import { HiMagnifyingGlass } from "react-icons/hi2";

export default function ChatFilterInput({ query, setQuery }) {
    return (
        <>
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full rounded-full border border-slate-100 py-1.5 px-4 pr-10 text-sm text-slate-700 shadow placeholder:text-slate-300 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300 lg:border-transparent"
                placeholder="Filter chats by names"
            />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-10 sm:-translate-x-12 md:-translate-x-10 lg:-translate-x-4">
                <HiMagnifyingGlass className="h-5 w-5 text-slate-300 " />
            </div>
        </>
    );
}