import { motion } from "framer-motion";

export default function Message(props) {
    return (
        <motion.div
            animate={{
                x: ["-100vw", "0vw", "0vw", "0vw"],
                opacity: [1, 1, 1, 0],
            }}
            transition={{
                duration: 10,
                times: [0, 0.1, 0.9, 1],
                delay: -2,
            }}
            className={`absolute top-12 left-4 z-50 w-5/6 max-w-xs rounded border-l-4 lg:top-14 lg:max-w-sm ${
                props.error
                    ? "border-l-red-500 dark:border-l-red-700"
                    : "border-l-green-500 dark:border-l-green-700"
            } bg-white py-3 px-4 shadow-md dark:bg-[#0b101d] lg:px-5`}
        >
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-50 lg:text-sm">
                {props.text}
            </p>
        </motion.div>
    );
}
