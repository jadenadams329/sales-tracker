import { FaUserCircle } from "react-icons/fa";
import { User } from "../../interfaces";
import { useSessionStore } from "../../store/SessionStore";
import { useEffect, useState, useRef } from "react";

interface ProfileButtonProps {
	user: User;
}

function ProfileButton({ user }: ProfileButtonProps) {
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const ulRef = useRef<HTMLUListElement>(null);

	const logout = useSessionStore((state) => state.logout);

	const toggleMenu = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowMenu(!showMenu);
	};

	const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		await logout();
	};

	useEffect(() => {
		if (!showMenu) return;

		const closeMenu = (e: MouseEvent) => {
			if (ulRef.current && !ulRef.current.contains(e.target as Node)) {
				setShowMenu(false);
			}
		};

		document.addEventListener("click", closeMenu);
		return () => document.removeEventListener("click", closeMenu);
	}, [showMenu]);

	const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

	return (
		<div>
			<button onClick={toggleMenu}>
				<FaUserCircle />
			</button>
			<ul ref={ulRef} className={ulClassName}>
				<li>
					{user.firstName} {user.lastName}
				</li>
				<li>{user.email}</li>
				<li>
					<button onClick={handleLogout}>Log Out</button>
				</li>
			</ul>
		</div>
	);
}

export default ProfileButton;
