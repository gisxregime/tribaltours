@props([
    'reference' => 'BK-000001',
    'tour' => 'Tour Name',
    'date' => 'TBD',
    'status' => 'pending',
    'amount' => '0',
])

<article class="surface p-3 d-grid gap-2">
    <div class="d-flex justify-content-between align-items-center">
        <p class="mb-0 fw-semibold">{{ $tour }}</p>
        <span class="side-badge text-uppercase">{{ $status }}</span>
    </div>
    <p class="mb-0 text-muted small">Reference: {{ $reference }}</p>
    <p class="mb-0 text-muted small">Date: {{ $date }}</p>
    <p class="mb-0 fw-bold">{{ $amount }}</p>
</article>
