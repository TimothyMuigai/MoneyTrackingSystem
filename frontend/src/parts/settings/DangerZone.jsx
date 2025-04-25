/* eslint-disable no-unused-vars */

import AuthContext from "@/context/AuthContext";
import SettingsContext from "@/context/SettingsContext";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import DeleteAccount from "./DeleteAccount";

const DangerZone = () => {
	const { deleteAccount } = useContext(SettingsContext);
	const { logoutUser } = useContext(AuthContext);
	const [del, setDelete] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleDelete = async () => {
		setLoading(true);
		try {
			await deleteAccount();
			logoutUser();
			toast.info("Your account is deleted");
		} catch (error) {
			toast.error("Failed to delete account. Try again.");
		} finally {
			setLoading(false);
		}
	};
	 
	return (
	<>
		<motion.div
			className='bg-red-900 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-red-700 mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className='flex items-center mb-4'>
				<Trash2 className='text-red-400 mr-3' size={24} />
				<h2 className='text-xl font-semibold text-gray-100'>Danger Zone</h2>
			</div>
			<p className='text-gray-300 mb-4'>Permanently delete your account and all of your content.</p>
			<button
				className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded 
      transition duration-200'
	  onClick={()=> setDelete(true)}
			>
				Delete Account
			</button>
		</motion.div>
		{del &&
			<DeleteAccount
				isOpen={del} 
				onClose={() => setDelete(false)} 
				onConfirm={() => handleDelete()} 
				info="Account"
				loading={loading}
			/>
		}
	</>
	);
};
export default DangerZone;