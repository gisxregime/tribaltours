import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
    forceTLS: true,
});

window.Echo.channel('test-channel')
    .listen('TestRealtimeEvent', (payload) => {
        console.log('[Echo] TestRealtimeEvent received:', payload);
    });
