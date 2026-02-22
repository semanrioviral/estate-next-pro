"use client";

import NavbarV3 from "@/components/design-system/NavbarV3";
import FooterV3 from "@/components/design-system/FooterV3";
import { usePathname } from "next/navigation";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <>
            <NavbarV3 />
            <main className={`min-h-screen ${isHome ? "pt-0" : "pt-20 md:pt-24"}`}>
                {children}
            </main>
            <FooterV3 />
        </>
    );
}
