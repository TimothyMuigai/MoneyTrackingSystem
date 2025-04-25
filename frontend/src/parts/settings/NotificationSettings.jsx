import { useEffect, useState } from "react";
import SettingSection from "./SettingSection";
import { Bell } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const NotificationSettings = () => {
	const [notifications, setNotifications] = useState({
		push: false,
	});

	useEffect(() => {
		const savedSettings = localStorage.getItem("notificationPreferences");
		if (savedSettings) {
			setNotifications(JSON.parse(savedSettings));
		}
	}, []);

	const handleToggle = () => {
		const updated = { ...notifications, push: !notifications.push };
		setNotifications(updated);
		localStorage.setItem("notificationPreferences", JSON.stringify(updated));
		window.location.reload();
	};

	return (
		<SettingSection icon={Bell} title={"Notifications"}>
			<ToggleSwitch
				label={"Push Notifications"}
				isOn={notifications.push}
				onToggle={handleToggle}
			/>
		</SettingSection>
	);
};

export default NotificationSettings;
