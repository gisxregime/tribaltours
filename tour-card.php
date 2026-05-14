<?php
declare(strict_types=1);

if (!function_exists('render_tour_card')) {
    function render_tour_card(array $tour): void
    {
        $e = static fn($value): string => htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');

        $title = (string) ($tour['title'] ?? 'Untitled Tour');
        $location = (string) ($tour['location'] ?? 'Unknown destination');
        $duration = (string) ($tour['duration'] ?? '2 days');
        $guide = (string) ($tour['guide'] ?? 'Local Guide');
        $group = (string) ($tour['group'] ?? '2-8 pax');
        $price = number_format((float) ($tour['price'] ?? 0));
        $rating = number_format((float) ($tour['rating'] ?? 4.5), 1);
        $reviewCount = number_format((float) ($tour['reviews'] ?? 120));
        $difficulty = (string) ($tour['difficulty'] ?? 'Easy');
        $imageUrl = (string) ($tour['image_url'] ?? 'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80');
        $guideAvatar = (string) ($tour['guide_avatar'] ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80');
        $badge = (string) ($tour['badge'] ?? 'Featured');
        $tags = $tour['tags'] ?? [];

        $searchBlob = strtolower($title . ' ' . $location . ' ' . $guide . ' ' . $difficulty . ' ' . implode(' ', $tags));
        ?>
<article
    class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    data-feed-card
    data-card-type="tour"
    data-search="<?php echo $e($searchBlob); ?>"
>
    <div class="relative">
        <img src="<?php echo $e($imageUrl); ?>" alt="<?php echo $e($location); ?>" class="h-48 w-full object-cover">
        <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">
            <?php echo $e($badge); ?>
        </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
        <p class="text-xs text-stone-500"><?php echo $e($location); ?></p>
        <h3 class="mt-1 line-clamp-2 text-xl font-semibold"><?php echo $e($title); ?></h3>

        <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
            <img src="<?php echo $e($guideAvatar); ?>" alt="<?php echo $e($guide); ?>" class="h-7 w-7 rounded-full object-cover">
            <span class="font-medium"><?php echo $e($guide); ?></span>
            <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
        </div>

        <p class="mt-2 text-sm text-stone-600"><?php echo $e($rating); ?> (<?php echo $e($reviewCount); ?>) • <?php echo $e($duration); ?> • <?php echo $e($group); ?> • <?php echo $e($difficulty); ?></p>

        <?php if (!empty($tags)): ?>
            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                <?php foreach ($tags as $tag): ?>
                    <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600"><?php echo $e($tag); ?></span>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
            <p class="text-3xl font-bold">₱<?php echo $e($price); ?> <span class="text-sm font-medium text-stone-500">/ person</span></p>
            <a href="#" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
        </div>
    </div>
</article>
        <?php
    }
}
