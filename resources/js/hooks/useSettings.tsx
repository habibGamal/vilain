import { usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';

interface SiteConfig {
    site_title: string;
    site_logo?: string;
    site_icon?: string;
    maintenance_mode: boolean;
    contact_email?: string;
    social_links: Record<string, string>;
    facebook_pixel_url?: string;
    facebook_pixel_id?: string;
}

interface PagePropsWithSettings extends PageProps {
    settings?: SiteConfig;
    [key: string]: any;
}

/**
 * Custom hook to access site settings from Inertia page props
 */
export function useSettings(): SiteConfig {
    const { props } = usePage<PagePropsWithSettings>();
    return props.settings || {
        site_title: 'Vilain',
        maintenance_mode: false,
        social_links: {},
    };
}

/**
 * Get a specific setting value with fallback
 */
export function getSetting<T = any>(key: keyof SiteConfig, fallback?: T): T {
    const settings = useSettings();
    const value = settings[key];
    return (value !== undefined ? value : fallback) as T;
}

/**
 * Check if maintenance mode is enabled
 */
export function useMaintenanceMode(): boolean {
    return getSetting('maintenance_mode', false);
}

/**
 * Get social media links
 */
export function useSocialLinks(): Record<string, string> {
    return getSetting('social_links', {});
}

/**
 * Get site branding information
 */
export function useSiteBranding() {
    const settings = useSettings();
    return {
        title: settings.site_title || 'Vilain',
        logo: settings.site_logo,
        icon: settings.site_icon,
    };
}
/**
 * Higher-order component to provide settings to any component
 */
export function withSettings<P extends object>(
    Component: React.ComponentType<P & { settings: SiteConfig }>
) {
    return function WrappedComponent(props: P) {
        const settings = useSettings();
        return <Component {...props} settings={settings} />;
    };
}
