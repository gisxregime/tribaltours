@props([
    'touristName' => 'Tourist Name',
    'dateLabel' => 'Today',
    'guests' => '2 pax',
    'status' => 'Pending',
    'tourTitle' => 'Requested Tour',
    'messagePreview' => 'Tour request details',
    'price' => '0',
    'avatar' => 'images/39.jpg',
])

<article class="rounded-2xl border border-[#e7e1d5] bg-white shadow-sm p-4">
    <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
            <img src="{{ asset($avatar) }}" alt="{{ $touristName }}" class="h-10 w-10 rounded-full object-cover">
            <div>
                <p class="font-semibold text-[#241f18]">{{ $touristName }}</p>
                <p class="text-xs text-[#8a7f6a]">{{ $dateLabel }} • {{ $guests }}</p>
            </div>
        </div>
        <span class="rounded-full bg-[#f4efdf] text-[#8b6d2d] text-xs px-2.5 py-1 font-semibold">{{ $status }}</span>
    </div>
    <h4 class="mt-3 text-base font-semibold text-[#241f18]">{{ $tourTitle }}</h4>
    <p class="mt-1 text-sm text-[#6f6553]">{{ $messagePreview }}</p>
    <div class="mt-4 flex items-center justify-between">
        <p class="text-lg font-bold text-[#1f1a12]">{{ $price }}</p>
        <div class="flex gap-2">
            <button class="rounded-xl bg-[#5f7f37] px-3 py-2 text-white text-sm font-semibold" type="button">Accept</button>
            <button class="rounded-xl border border-[#e0d9ca] bg-white px-3 py-2 text-[#564c3a] text-sm font-semibold" type="button">Decline</button>
        </div>
    </div>
</article>
