<?php
declare(strict_types=1);

if (!function_exists('render_request_post_card')) {
    function render_request_post_card(array $request): void
    {
        $e = static fn($value): string => htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');

        $status = (string) ($request['status'] ?? 'open');
        $statusMap = [
            'open' => ['label' => 'Open', 'class' => 'bg-blue-100 text-blue-800'],
            'negotiating' => ['label' => 'Negotiating', 'class' => 'bg-amber-100 text-amber-800'],
            'selected' => ['label' => 'Guide Selected', 'class' => 'bg-emerald-100 text-emerald-800'],
            'completed' => ['label' => 'Completed', 'class' => 'bg-slate-200 text-slate-700'],
            'cancelled' => ['label' => 'Cancelled', 'class' => 'bg-rose-100 text-rose-800'],
        ];

        $badge = $statusMap[$status] ?? $statusMap['open'];
        $title = (string) ($request['title'] ?? 'Custom Trip Request');
        $location = (string) ($request['location'] ?? 'Flexible location');
        $duration = (string) ($request['duration'] ?? 'Flexible duration');
        $budget = (string) ($request['budget'] ?? '$500 - $1200');
        $travelers = (string) ($request['travelers'] ?? '2 Adults');
        $offers = (string) ($request['offers'] ?? '0');
        $tags = $request['tags'] ?? [];

        $searchBlob = strtolower($title . ' ' . $location . ' ' . $duration . ' ' . implode(' ', $tags));
        ?>
<article
    class="overflow-hidden rounded-3xl border border-amber-900/15 bg-amber-50/90 shadow-card"
    data-feed-card
    data-card-type="request"
    data-status="<?php echo $e($status); ?>"
    data-search="<?php echo $e($searchBlob); ?>"
>
    <div class="bg-gradient-to-r from-amber-900 to-ember p-4 text-amber-100">
        <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em]">Request Post</p>
            <span data-status-badge class="rounded-full px-3 py-1 text-xs font-bold <?php echo $e($badge['class']); ?>"><?php echo $e($badge['label']); ?></span>
        </div>
        <h3 class="mt-2 font-heading text-xl font-bold"><?php echo $e($title); ?></h3>
    </div>

    <div class="p-5">
        <div class="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>Location: <span class="font-semibold text-slate-900"><?php echo $e($location); ?></span></p>
            <p>Duration: <span class="font-semibold text-slate-900"><?php echo $e($duration); ?></span></p>
            <p>Travelers: <span class="font-semibold text-slate-900"><?php echo $e($travelers); ?></span></p>
            <p>Budget: <span class="font-semibold text-slate-900"><?php echo $e($budget); ?></span></p>
        </div>

        <?php if (!empty($tags)): ?>
            <div class="mt-4 flex flex-wrap gap-2">
                <?php foreach ($tags as $tag): ?>
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"><?php echo $e($tag); ?></span>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="mt-5 flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700">Offers received: <span class="text-ink"><?php echo $e($offers); ?></span></p>
            <button class="rounded-xl border border-ink/20 px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink hover:text-amber-100" type="button">
                View Offers
            </button>
        </div>
    </div>
</article>
        <?php
    }
}
