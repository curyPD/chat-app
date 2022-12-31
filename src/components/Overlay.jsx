import { motion } from "framer-motion";

export default function Overlay({ children, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
            }}
            transition={{ duration: 0.2 }}
            exit={{
                opacity: 0,
            }}
            className="fixed top-0 left-0 z-40 flex h-screen w-screen items-center justify-center bg-black/60"
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}
