@props([
    'title' => 'Tour Title',
    'status' => 'Published',
    'schedule' => 'Flexible schedule',
    'price' => '0',
    'image' => 'images/pangasinan.jpg',
    'location' => 'Philippines',
    'link' => null,
])

<article class="tour-card feed-item">
    <div class="relative">
        <img src="{{ asset($image) }}" alt="{{ $title }}" class="h-48 w-full object-cover">
    </div>
    <div class="flex flex-1 flex-col p-4">
        <p class="text-xs text-stone-500">{{ $location }}</p>
        <h3 class="mt-1 line-clamp-2 text-xl font-semibold">{{ $title }}</h3>
        <p class="mt-2 text-sm text-stone-600">{{ $schedule }}</p>
        <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
            <p class="text-3xl font-bold">{{ $price }}</p>
            @if ($link)
                <a href="{{ $link }}" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
            @else
                <span class="rounded-full bg-[#C7A34A]/20 px-3 py-1 text-xs font-semibold text-[#9A742A]">{{ $status }}</span>
            @endif
        </div>
    </div>
</article>
