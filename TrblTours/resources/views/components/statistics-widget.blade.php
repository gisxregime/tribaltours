@props([
    'label' => 'Metric',
    'value' => '0',
    'subtitle' => null,
])

<article class="stat-card">
    <p class="text-muted small">{{ $label }}</p>
    <p class="value">{{ $value }}</p>
    @if($subtitle)
        <p class="mb-0 text-muted small">{{ $subtitle }}</p>
    @endif
</article>
