import ApplicationLogo from "@/Components/ApplicationLogo";
import SearchBar from "@/Components/SearchBar";
import Footer from "@/Components/Footer";
import { useI18n } from "@/hooks/use-i18n";
import { Link, router, usePage } from "@inertiajs/react";
import {
    PropsWithChildren,
    ReactNode,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

// Import our custom components
import DesktopNav from "@/Components/DesktopNav";
import MobileBottomNav from "@/Components/MobileBottomNav";
import MobileNav from "@/Components/MobileNav";
import UserActions from "@/Components/UserActions";
import { MaintenanceWrapper } from "@/Components/Settings/SettingsComponents";
import { App } from "@/types";

export default function MainLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, categories, brands ,cartInfo: cart} =
        usePage<App.Interfaces.AppPageProps>().props;
    const { direction, t, getLocalizedField } = useI18n();
    const user = auth?.user;

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const cartItemsCount = cart.itemsCount; // This would be replaced with actual cart data from backend
    const handleSearchClick = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const section = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        router.on("start", (e) => {
            if (
                e.detail.visit.method !== "get" ||
                e.detail.visit.url.pathname === window.location.pathname ||
                e.detail.visit.only.length !== 0
            )
                return;
            section.current?.classList.remove("section-loaded");
            section.current?.classList.add("section-go-away");
        });
        router.on("finish", (e) => {
            if (
                e.detail.visit.method !== "get" ||
                e.detail.visit.only.length !== 0
            )
                return;
            section.current?.classList.remove("section-go-away");
            section.current?.classList.add("section-loaded");
        });
        window.addEventListener("popstate", () => {
            setTimeout(
                () =>
                    window.scrollTo({
                        top: window.history.state.documentScrollPosition.top,
                        behavior: "smooth",
                    }),
                100
            );
        });
    }, []);

    return (
        <MaintenanceWrapper>
            <div
                className="flex min-h-screen flex-col bg-background"
                dir={direction}
            >
                {/* Desktop Navigation */}
                <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 gap-4 items-center px-4">
                        {/* Logo */}
                        <div className="flex items-center ltr:mr-4 rtl:ml-4">
                            <Link href="/">
                                <ApplicationLogo className="h-8 w-auto" />
                            </Link>
                        </div>

                        {/* Desktop Nav Links */}
                        <DesktopNav brands={brands} categories={categories} />

                        {/* User Actions (Search, Wishlist, User/Login, Cart) */}
                        <UserActions
                            user={user}
                            cartItemsCount={cartItemsCount}
                            onSearchClick={handleSearchClick}
                        />

                        {/* Mobile Navigation Menu Button */}
                        <MobileNav brands={brands} categories={categories} />
                    </div>

                    {/* Search Bar Component */}
                    <SearchBar
                        isOpen={isSearchOpen}
                        onClose={() => setIsSearchOpen(false)}
                    />
                </nav>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav
                    cartItemsCount={cartItemsCount}
                    onSearchClick={handleSearchClick}
                />

                {/* Main Content */}
                {header && (
                    <header className="bg-white shadow">
                        <div className="container mx-auto px-4 py-6">{header}</div>
                    </header>
                )}

                <main className="container flex-1 px-4 py-4 pb-16 lg:pb-8">
                    <div ref={section} className="">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </MaintenanceWrapper>
    );
}
