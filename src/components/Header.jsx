import { Link, useNavigate } from "react-router-dom"
import { useAuthHeader, useIsAuthenticated, useSignOut } from "react-auth-kit";
import { logoutAPI } from "../api/auth";
import { HasAccess } from "@permify/react-role";
import ToggleThemeSwitch from "./ToggleThemeSwitch";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
    const { isLightMode } = useTheme();
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated()
    const authHeader = useAuthHeader();
    const signOut = useSignOut();

    const handleLogout = async () => {

        const response = await logoutAPI(authHeader());

        if (response.status === 'success') {
            signOut();
            navigate('/login');
        } else {
            console.error('Logout failed:', response.message);
        }
    };
    return (
        <header className={`${isLightMode ? 'bg-white text-[#111315] border-b' : 'bg-[#111315] text-white'}`}>
            <div className="mx-auto max-w-7xl flex items-center justify-between h-[62px] px-[16px] md:px-0">
                <div className="space-x-10 flex items-center justify-start">
                    <Link to={'/'} >
                        <h1 className={`font-extrabold text-xl ${isLightMode ? 'text-black' : 'text-white'}`}>DSS</h1>
                    </Link>

                    {
                        isAuthenticated() && (
                            <HasAccess roles={["super-admin"]} permissions={['post', 'tag']}>
                                <button className="rounded-full text-[14px] leading-[18px] font-medium cursor-pointer"
                                    onClick={() => navigate('/tags')}>
                                    Tags
                                </button>
                                <button className="rounded-full text-[14px] leading-[18px] font-medium cursor-pointer"
                                    onClick={() => navigate('/posts')}>
                                    Posts
                                </button>
                                <button className="rounded-full text-[14px] leading-[18px] font-medium cursor-pointer"
                                    onClick={() => navigate('/notes')}>
                                    Notes
                                </button>
                            </HasAccess>
                        )
                    }
                </div>

                <div className="space-x-[24px] flex items-center">
                    <ToggleThemeSwitch />
                    {isAuthenticated() ? (
                        <button className="text-[14px] leading-[18px] font-medium cursor-pointer" onClick={handleLogout}>
                            Log out
                        </button>
                    ) : (
                        <>
                            <a className="text-[14px] leading-[18px] font-medium cursor-pointer" onClick={() => navigate('/login')}>
                                Log in
                            </a>
                            <a className={`py-[11px] px-[24px] bg-[#0071FF] rounded-full text-[14px] leading-[18px] ${isLightMode && 'text-white'} font-medium cursor-pointer`} onClick={() => navigate('/register')}>
                                Get Started
                            </a>
                        </>
                    )}
                </div>
            </div>
        </header>
    )

}