@if (session('status'))
    <div style="position:fixed;top:1rem;right:1rem;z-index:9999;background:#eaf7e2;border:1px solid #9bc27a;color:#2f5d19;padding:0.75rem 1rem;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,0.1);">
        {{ session('status') }}
    </div>
@endif

@if ($errors->any())
    <div style="position:fixed;top:1rem;left:1rem;z-index:9999;background:#fff1f1;border:1px solid #ef9a9a;color:#8a1f1f;padding:0.75rem 1rem;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,0.1);max-width:420px;">
        <strong>Validation Error</strong>
        <ul style="margin:0.4rem 0 0 1rem;padding:0;">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
