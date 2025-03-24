import { FaUserCircle } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { User } from "../../interfaces";
import { useSessionStore } from "../../store/SessionStore";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
interface ProfileButtonProps {
	user: User;
}

function ProfileButton({ user }: ProfileButtonProps) {
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const logout = useSessionStore((state) => state.logout);
	const navigate = useNavigate();
	const toggleMenu = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowMenu(!showMenu);
	};

	const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		await logout();
		navigate("/login");
	};

	useEffect(() => {
		if (!showMenu) return;

		const closeMenu = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setShowMenu(false);
			}
		};

		document.addEventListener("click", closeMenu);
		return () => document.removeEventListener("click", closeMenu);
	}, [showMenu]);

	const menuClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

	return (
		<div className='profile-button-container'>
			<button onClick={toggleMenu} className="profile-button">
				<FaUserCircle />
				{showMenu ? <FaChevronDown className="profile-arrow" /> : <FaChevronUp className="profile-arrow" />}
			</button>
			<div ref={menuRef} className={menuClassName}>
				<div className="dropdown-user-info">
					<div className="dropdown-user-name">
						{user.firstName} {user.lastName}
					</div>
					<div className="dropdown-user-email">{user.email}</div>
				</div>
				<div className="dropdown-bottom">
					<button onClick={handleLogout} className="dropdown-logout">Log Out</button>
				</div>
			</div>
		</div>
	);
}

export default ProfileButton;
