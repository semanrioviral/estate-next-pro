import NavbarV3 from "@/components/design-system/NavbarV3";
import FooterV3 from "@/components/design-system/FooterV3";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import MainContentWrapper from "./MainContentWrapper";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <NavbarV3 />
            <MainContentWrapper>
                {children}
            </MainContentWrapper>
            <FooterV3 />
            <WhatsAppFloatingButton />
        </>
    );
}
