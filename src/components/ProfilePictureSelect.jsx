import { HiOutlineCamera } from "react-icons/hi2";

export default function ProfilePictureSelect({ styles, handleFileUpload }) {
    return (
        <div className="absolute bottom-0 left-0 h-full w-full rounded-full bg-slate-900/50">
            <label
                htmlFor="fileInput"
                className="flex h-full w-full cursor-pointer items-center justify-center"
            >
                <HiOutlineCamera className="h-10 w-10 text-white/80 sm:h-12 sm:w-12 lg:h-10 lg:w-10" />
            </label>
            <input
                style={styles}
                type="file"
                name="file"
                id="fileInput"
                onChange={handleFileUpload}
            />
        </div>
    );
}
