import { HiXMark } from "react-icons/hi2";

export default function ImagePreviewBox({
    cancelFileSelect,
    filePreviewURL,
    setImageAspectRatio,
}) {
    return (
        <div className="fixed bottom-0 left-0 z-10 mb-[92px] w-full border-t border-slate-200 bg-slate-100 py-2 px-4 dark:border-slate-700 dark:bg-slate-800 md:mb-11 md:ml-14 md:w-fixed-bar-tablet lg:sticky lg:bottom-11 lg:top-10 lg:mb-0 lg:ml-0 lg:w-full">
            <div className="relative inline-block">
                <button
                    className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1.5 translate-x-1.5 items-center justify-center rounded-full bg-slate-600 transition-colors hover:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-600"
                    onClick={cancelFileSelect}
                >
                    <HiXMark className="h-3 w-3 text-white" />
                </button>
                <img
                    src={filePreviewURL}
                    alt="Selected image"
                    className="w-16"
                    onLoad={(e) =>
                        setImageAspectRatio(e.target.width / e.target.height)
                    }
                />
            </div>
        </div>
    );
}
