import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import { useSessionStore } from "../../store/SessionStore";
import './Navigation.css'

interface NavigationProps {
    isLoaded: boolean;
}

function Navigation({ isLoaded }: NavigationProps) {
    const user = useSessionStore((state) => state.user);

    const sessionLinks = user ? (
        <>
            <li>
                <ProfileButton user={user} />
            </li>
        </>
    ) : (
        <>
            <li>
                <NavLink to='/login'>Log In</NavLink>
            </li>
            <li>
                <NavLink to='/signup'>Sign Up</NavLink>
            </li>
        </>
    )
  return (
    <ul>
        <li>
            <NavLink to="/">Home</NavLink>
        </li>
        {isLoaded && sessionLinks}
    </ul>
  )
}

export default Navigation
