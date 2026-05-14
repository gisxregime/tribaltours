<section class="rounded-2xl border border-[#e6e0d4] bg-white shadow-sm flex flex-col h-[560px]">
    <header class="px-4 py-3 border-b border-[#ece6d9] flex items-center gap-3">
        <img src="../images/manila.jpg" alt="Tourist avatar" class="h-10 w-10 rounded-full object-cover">
        <div>
            <p class="font-semibold text-[#252018]">{{TOURIST_NAME}}</p>
            <p class="text-xs text-[#8a7f6a]">{{THREAD_SUBTITLE}}</p>
        </div>
    </header>
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf8f3]">
        <div class="max-w-[75%] rounded-2xl rounded-bl-md bg-white px-3 py-2 border border-[#e7e1d5] text-sm text-[#463d2f]">{{INCOMING_MESSAGE}}</div>
        <div class="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-[#dfead0] px-3 py-2 text-sm text-[#2f3f1c]">{{OUTGOING_MESSAGE}}</div>
    </div>
    <footer class="p-3 border-t border-[#ece6d9] flex items-center gap-2">
        <input type="text" placeholder="Type your message..." class="flex-1 rounded-xl border border-[#e3dccf] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c7a34a]/30">
        <button class="rounded-xl bg-[#c7a34a] hover:bg-[#b8923e] px-4 py-2 text-sm font-semibold text-white">Send</button>
    </footer>
</section>
