@isset($createRequestModal)
<div class="modal fade" id="createRequestModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="h5 mb-0">Create Tour Request</h2>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                {{ $createRequestModal }}
            </div>
        </div>
    </div>
</div>
@endisset
