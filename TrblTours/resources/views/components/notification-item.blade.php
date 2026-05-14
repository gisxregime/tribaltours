@props([
    'title' => 'New notification',
    'body' => 'Notification detail',
    'timestamp' => 'Just now',
    'href' => '#',
    'unread' => true,
])

<a href="{{ $href }}" class="d-block rounded-3 px-2 py-2 text-decoration-none {{ $unread ? 'bg-light' : '' }}">
    <p class="mb-1 fw-semibold text-dark">{{ $title }}</p>
    <p class="mb-1 small text-muted">{{ $body }}</p>
    <small class="text-muted">{{ $timestamp }}</small>
</a>
