import '../css/app.css';
import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './Contexts/LanguageContext';
import { Toaster } from './Components/ui/toaster';
import MainLayout from './Layouts/MainLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });
        const page = pages[`./Pages/${name}.tsx`];

        // Apply MainLayout as default if the page doesn't specify a layout
        if (page && !page.default.layout) {
            page.default.layout = (page) => <MainLayout>{page}</MainLayout>;
        }

        return pages[`./Pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <LanguageProvider>
                <App {...props} />
                <Toaster />
            </LanguageProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
