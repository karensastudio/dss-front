import { useNavigate } from "react-router-dom"
import { useAuthHeader, useIsAuthenticated, useSignOut } from "react-auth-kit";
import { logoutAPI } from "../api/auth";
import { HasAccess } from "@permify/react-role";

export default function Header() {

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
        <header className="bg-black">
            <div className="mx-auto max-w-7xl flex items-center justify-between h-[62px] px-[16px] md:px-0">
                <img src="./images/logo-white.svg" className="w-[28px]" alt="DSS Logo" />

                <div className="space-x-[24px]">
                    {isAuthenticated() ? (
                        <>
                           <HasAccess roles={["super-admin"]} permissions={['post', 'tag']}>
                                <button className="py-[11px] px-[24px] text-white bg-[#0071FF] rounded-full text-[14px] leading-[18px] font-medium cursor-pointer"
                                onClick={() => navigate('/posts/managemnet')}>
                                    Post management
                                </button>
                                <button className="py-[11px] px-[24px] text-white bg-[#0071FF] rounded-full text-[14px] leading-[18px] font-medium cursor-pointer"
                                onClick={() => navigate('/tags/managemnet')}>
                                     Tag management
                                </button>
                            </HasAccess>
                            <button className="text-[14px] leading-[18px] font-medium text-white cursor-pointer" onClick={handleLogout}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <a className="text-[14px] leading-[18px] font-medium text-white cursor-pointer" onClick={() => navigate('/login')}>
                                Log in
                            </a>
                            <a className="py-[11px] px-[24px] text-white bg-[#0071FF] rounded-full text-[14px] leading-[18px] font-medium cursor-pointer" onClick={() => navigate('/register')}>
                                Get Started
                            </a>
                        </>
                    )}
                </div>
            </div>
        </header>
    )

}