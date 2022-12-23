import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

export default function Index() {
    return (
        <div className="h-full overflow-y-auto">
            <main className="mx-0 flex h-full min-h-0 max-w-none flex-col items-center justify-center overflow-y-auto rounded-2xl rounded-t-3xl border border-slate-200 bg-white/50 px-8 pb-8 pt-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
                <HiOutlineChatBubbleLeftRight className="h-12 w-12 text-sky-300" />
                <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                    Select a chat or start a new one
                </p>
            </main>
        </div>
    );
}
