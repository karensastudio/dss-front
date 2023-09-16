export default function Header() {

    return (
        <header className="bg-black">
            <div className="mx-auto max-w-7xl flex items-center justify-between h-[62px] px-[16px] md:px-0">
                <img src="./images/logo-white.svg" className="w-[28px]" alt="DSS Logo" />

                <div className="space-x-[24px]">
                    <a href="" className="text-[14px] leading-[18px] font-medium text-white">
                        Log in
                    </a>
                    <a href="" className="py-[11px] px-[24px] text-white bg-[#0071FF] rounded-full text-[14px] leading-[18px] font-medium">
                        Get Started
                    </a>
                </div>
            </div>
        </header>
    )

}