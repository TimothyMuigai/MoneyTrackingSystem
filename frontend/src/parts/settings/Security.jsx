// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, X } from "lucide-react";
import SettingSection from "./SettingSection";
import ProfileContext from "@/context/ProfileContext";
import { toast } from "sonner";

const Security = () => {
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const { PasswordChange, loading } = useContext(ProfileContext);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => {
		setIsModalOpen(false);
		setConfirmPassword("")
		setNewPassword("")
		setOldPassword("")
	};


    const validatePassword = (password) => {
        if (!oldPassword) toast.error("Current password is required.");
		if (!password) toast.error("New password is required.");
        
        if (password !== confirmPassword){
            toast.error("Passwords doesn't match")
        }
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters long.");
          return false;
        }
      
        if (!/[!@#$%^&*]/.test(password)) {
          toast.error("Password must contain at least one special character (!@#$%^&*).");
          return false;
        }
      
        if (!/\d/.test(password)) {
          toast.error("Password must contain at least one number.");
          return false;
        }
      
        if (!/[a-z]/.test(password)) {
          toast.error("Password must contain at least one lowercase letter.");
          return false;
        }
      
        if (!/[A-Z]/.test(password)) {
          toast.error("Password must contain at least one uppercase letter.");
          return false;
        }
      
        return true;
      };
    
	const handleSubmit = async (e) => {
		e.preventDefault();
        
        if (!validatePassword(newPassword)) {
            return;
        }
		await PasswordChange(oldPassword, newPassword);

	};

	return (
		<SettingSection icon={Lock} title={"Security"}>
			<div className="mt-4">
				<button
					className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200"
					onClick={openModal}
				>
					Change Password
				</button>
			</div>

			{isModalOpen &&
				createPortal(
					<div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
						<motion.div
							className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<button
								className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
								onClick={closeModal}
							>
								<X size={20} />
							</button>

							<h2 className="text-xl font-semibold mb-4 text-center">
								Update Password
							</h2>

							<form onSubmit={handleSubmit}>
								<div className="mb-4">
									<label className="block text-gray-400">Current Password</label>
									<input
										type="password"
										name="oldPassword"
										value={oldPassword}
										onChange={(e) => setOldPassword(e.target.value)}
										className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
										required
									/>
								</div>

								<div className="mb-4">
									<label className="block text-gray-400">New Password</label>
									<input
										type="password"
										name="newPassword"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
										required
									/>
								</div>

								<div className="mb-4">
									<label className="block text-gray-400">Confirm Password</label>
									<input
										type="password"
										name="confirmPassword"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
										required
									/>
								</div>

								<button
									type="submit"
									className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200"
								>
									{loading ? (
                                    <motion.div
                                        className="flex justify-center items-center gap-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="loader animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full"></span>
                                        Updating Password...
                                    </motion.div>
                                    ) : (
                                    "Save Password"
                                    )}
								</button>
							</form>
						</motion.div>
					</div>,
					document.body
				)}
		</SettingSection>
	);
};

export default Security;
