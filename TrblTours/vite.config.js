import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/assets/styles.css',
                'resources/assets/landing.css',
                'resources/assets/auth.css',
                'resources/assets/app.js',
                'resources/assets/guide.js',
                'resources/assets/landing.js',
                'resources/assets/auth.js',
            ],
            refresh: true,
        }),
    ],
});
