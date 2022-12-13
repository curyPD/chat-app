import { HiOutlineCamera } from "react-icons/hi2";

export default function ProfilePictureSelect({ styles, handleFileUpload }) {
    return (
        <div className="absolute bottom-0 left-0 flex h-full w-full items-center justify-center rounded-full bg-slate-900/50">
            <label htmlFor="fileInput">
                <HiOutlineCamera className="h-9 w-9 text-white/80" />
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
