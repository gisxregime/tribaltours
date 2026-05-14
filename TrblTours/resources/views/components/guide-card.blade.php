@props([
    'name' => 'Guide Name',
    'avatar' => 'images/manila.jpg',
    'rating' => '4.9',
    'specialty' => 'Local Expert',
    'verified' => true,
])

<article class="surface p-3 d-flex align-items-center gap-3">
    <img src="{{ asset($avatar) }}" alt="{{ $name }}" class="rounded-circle object-fit-cover" width="54" height="54">
    <div>
        <p class="mb-1 fw-semibold">{{ $name }}</p>
        <p class="mb-1 text-muted small">{{ $specialty }}</p>
        <p class="mb-0 small">{{ $rating }} @if($verified)<span class="text-success">• Verified</span>@endif</p>
    </div>
</article>
