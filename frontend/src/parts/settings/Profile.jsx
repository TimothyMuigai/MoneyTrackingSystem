import React, {  useContext, useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import { User, X } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import SettingSection from "./Settingsection";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileSkeleton from "./ProfileSkeleton";
import { toast } from "sonner";
import ProfileContext from "@/context/ProfileContext";
import { createPortal } from "react-dom";

function Profile() {
  let [userData, setUserData] = useState(null);

  let { userProfile, loading } = useContext(ProfileContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  let api = useAxios();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      let response = await api.get("/api/profile/");
      setUserData(response.data)
      setNewUsername(response.data.username);
      setNewEmail(response.data.email);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error... Cannot fetch profile")
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
        newUsername === userData.username &&
        newEmail === userData.email &&
        newProfilePic === null
    ) {
        toast.info("Make some changes first");
        return;
    }

    const formData = new FormData();
    formData.append("username", newUsername);
    formData.append("email", newEmail);

    if (newProfilePic) {
      formData.append("image", newProfilePic);
    }

    try {
      await userProfile(newEmail, newUsername, newProfilePic);
      setIsModalOpen(!isModalOpen)
      fetchUserProfile()
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

    const getImageUrl = (image) => {
        if (!image) return <Skeleton className="rounded-full w-20 h-20 mr-4" />;

        if (image.startsWith("image/upload/https://")) {
        return image.replace("image/upload/", "");
        }
    
        if (image.startsWith("http")) return image;
        return `https://res.cloudinary.com/devs9of9t/${image.replace("image/upload/", "")}`;
    };

  if (!userData) {
    return <ProfileSkeleton/>;
  }

  return (
    <SettingSection icon={User} title={"Profile"}>
      <div className="flex flex-col sm:flex-row items-center mb-6">
        <img
          src={getImageUrl(userData.image)}
          alt="Profile"
          className="rounded-full w-20 h-20 object-cover mr-4"
        />

        <div>
          <div className="mb-1">
            <label className="text-gray-500 text-sm">Username:</label>
            <h3 className="text-lg font-semibold text-gray-100">{userData.username}</h3>
          </div>

          <div>
            <label className="text-gray-500 text-sm">Email:</label>
            <p className="text-gray-400">{userData.email}</p>
          </div>
        </div>
      </div>

      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto"
        onClick={() => setIsModalOpen(true)}
      >
        Edit Profile
      </button>


      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-center">Edit Profile</h2>

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center space-y-3 relative">
                  <label htmlFor="profile-pic-upload" className="cursor-pointer relative w-32 h-32">
                    <img
                      id="profile-pic"
                      src={preview ||getImageUrl(userData.image)}
                      className="w-32 h-32 rounded-full shadow-md border object-cover hover:opacity-80 transition duration-200"
                      alt="Profile"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white font-semibold bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition duration-200">
                      Click to change
                    </span>
                  </label>
                  <input id="profile-pic-upload" type="file" className="hidden" onChange={handleFileChange} />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200">
                  {loading ? (
                        <motion.div
                        className="flex justify-center items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        >
                        <span className="loader animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full"></span>
                        Saving changes...
                        </motion.div>
                    ) : (
                        "Save Changes"
                    )}
                </button>
              </form>
            </motion.div>
          </div>,
          document.body
        )}
    </SettingSection>
  );
}

export default Profile;