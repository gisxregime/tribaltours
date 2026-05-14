@props([
    'name' => 'Traveler',
    'message' => 'Message preview',
    'time' => 'Now',
    'avatar' => 'images/manila.jpg',
    'unread' => false,
])

<article class="surface p-3 d-flex align-items-start gap-3">
    <img src="{{ asset($avatar) }}" alt="{{ $name }}" class="rounded-circle object-fit-cover" width="44" height="44">
    <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-center gap-3">
            <p class="mb-1 fw-semibold">{{ $name }}</p>
            <small class="text-muted">{{ $time }}</small>
        </div>
        <p class="mb-0 text-muted small">{{ $message }}</p>
    </div>
    @if($unread)
        <span class="unread-badge">1</span>
    @endif
</article>
