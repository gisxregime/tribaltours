@props([
    'buttonId' => 'notificationBtn',
    'listId' => 'notificationList',
    'badgeId' => 'notificationBadge',
    'menuClass' => '',
])

<div class="dropdown">
    <button class="icon-btn" id="{{ $buttonId }}" type="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" aria-label="Open notifications">
        <i class="fa-solid fa-bell"></i>
        <span id="{{ $badgeId }}" class="unread-badge">0</span>
    </button>
    <div class="dropdown-menu dropdown-menu-end notification-menu {{ $menuClass }}">
        <div class="d-flex justify-content-between align-items-center px-2 pb-2 border-bottom">
            <strong>Notifications</strong>
            <small class="text-muted">Live updates</small>
        </div>
        <div id="{{ $listId }}" class="d-grid gap-1 pt-2"></div>
    </div>
</div>
