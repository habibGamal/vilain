import React from 'react';
import { Link } from '@inertiajs/react';
import { SocialLinks, ContactInfo, SiteLogo } from '@/Components/Settings/SettingsComponents';
import { useI18n } from '@/hooks/use-i18n';

export default function Footer() {
    const { t } = useI18n();

    return (
        <footer className="bg-muted/50 border-t mt-auto">
            <div className="container px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo & Description */}
                    <div className="space-y-4">
                        <SiteLogo showTitle={true} />
                        <p className="text-sm text-muted-foreground">
                            {t('footer_description', 'Your trusted online shopping destination')}
                        </p>
                        <ContactInfo />
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">{t('quick_links', 'Quick Links')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('categories', 'Categories')}
                                </a>
                            </li>
                            <li>
                                <a href="/brands" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('brands', 'Brands')}
                                </a>
                            </li>
                            <li>
                                <a href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('my_orders', 'My Orders')}
                                </a>
                            </li>
                            <li>
                                <a href="/wishlist" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('wishlist', 'Wishlist')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">{t('follow_us', 'Follow Us')}</h3>
                        <SocialLinks showLabels={true} className="flex-col items-start" />
                    </div>
                </div>

                <hr className="my-6" />

                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} {t('all_rights_reserved', 'All rights reserved')}
                    </p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">
                            {t('privacy_policy', 'Privacy Policy')}
                        </Link>
                        <Link href="/returns" className="hover:text-foreground transition-colors">
                            {t('return_policy', 'Return Policy')}
                        </Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            {t('terms_of_service', 'Terms of Service')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
