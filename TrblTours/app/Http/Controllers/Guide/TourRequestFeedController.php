<?php

namespace App\Http\Controllers\Guide;

use App\Events\TourRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\TourRequest;
use App\Models\TourRequestComment;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class TourRequestFeedController extends Controller
{
    private static ?bool $hasTourRequestCommentsTable = null;

    public function index(Request $request): JsonResponse
    {
        $query = TourRequest::query()
            ->with(['tourist', 'selectedGuide'])
            ->where('status', 'open')
            ->where('is_active', true)
            ->whereNull('selected_guide_id')
            ->latest()
            ->limit(100);

        if ($this->hasTourRequestCommentsTable()) {
            $query->with('comments.author');
        }

        $requests = $query
            ->get()
            ->map(function (TourRequest $tourRequest) {
                return $this->presentRequest($tourRequest);
            })
            ->values();

        return response()->json([
            'ok' => true,
            'requests' => $requests,
            'pusher' => [
                'key' => env('PUSHER_APP_KEY'),
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function comments(Request $request, TourRequest $tourRequest): JsonResponse
    {
        if ((int) ($tourRequest->selected_guide_id ?? 0) > 0 || !$tourRequest->is_active || (string) $tourRequest->status !== 'open') {
            return response()->json([
                'ok' => false,
                'message' => 'This request is already closed.',
            ], 403);
        }

        if (!$this->hasTourRequestCommentsTable()) {
            return response()->json([
                'ok' => true,
                'comments' => [],
            ]);
        }

        $tourRequest->loadMissing('comments.author');

        return response()->json([
            'ok' => true,
            'comments' => $this->presentComments($tourRequest),
        ]);
    }

    public function comment(Request $request, TourRequest $tourRequest): JsonResponse
    {
        if (!$this->hasTourRequestCommentsTable()) {
            return response()->json([
                'ok' => false,
                'message' => 'Comments are temporarily unavailable until database updates are applied.',
            ], 503);
        }

        if ((int) ($tourRequest->selected_guide_id ?? 0) > 0 || !$tourRequest->is_active || (string) $tourRequest->status !== 'open') {
            return response()->json([
                'ok' => false,
                'message' => 'This request is already closed for new negotiation.',
            ], 403);
        }

        $payload = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
            'parent_comment_id' => ['nullable', 'exists:tour_request_comments,id'],
            'offer_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $parentComment = null;
        if (!empty($payload['parent_comment_id'])) {
            $parentComment = TourRequestComment::query()
                ->where('tour_request_id', $tourRequest->id)
                ->where('id', (string) $payload['parent_comment_id'])
                ->first();

            if (!$parentComment) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Unable to locate parent comment for this request.',
                ], 422);
            }
        }

        TourRequestComment::query()->create([
            'tour_request_id' => $tourRequest->id,
            'parent_comment_id' => $parentComment?->id,
            'author_id' => $request->user()->id,
            'author_role' => 'guide',
            'author_name' => trim((string) $request->user()->name),
            'author_avatar_url' => $this->resolveAvatarPath($request->user()->avatar_path),
            'text' => trim((string) $payload['text']),
            'offer_amount' => isset($payload['offer_amount']) ? (float) $payload['offer_amount'] : null,
        ]);

        $tourRequest->loadMissing('tourist');
        DomainNotification::notifyUser(
            $tourRequest->tourist,
            'tour-request.updated',
            trim((string) $request->user()->name) . ' commented on your request "' . trim((string) $tourRequest->title) . '".',
            [
                'requestId' => (string) $tourRequest->id,
            ]
        );

        event(new TourRequestUpdated($tourRequest->fresh(['tourist', 'selectedGuide', 'comments.author'])));

        return response()->json([
            'ok' => true,
            'request' => $this->presentRequest($tourRequest->fresh(['tourist', 'selectedGuide', 'comments.author'])),
        ]);
    }

    private function presentRequest(TourRequest $tourRequest): array
    {
        $tourist = $tourRequest->tourist;
        $selectedGuide = $tourRequest->selectedGuide;
        $locationBits = array_filter([
            $tourRequest->city,
            $tourRequest->province,
        ]);

        $comments = $this->presentComments($tourRequest);
        $statusBucket = (int) ($tourRequest->selected_guide_id ?? 0) > 0
            ? 'selected'
            : strtolower(trim((string) $tourRequest->status));

        return [
            'id' => (string) $tourRequest->id,
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => $this->resolveAvatarPath($tourist?->avatar_path),
            'touristId' => $tourist?->id ? (string) $tourist->id : null,
            'title' => (string) $tourRequest->title,
            'description' => (string) ($tourRequest->description ?? ''),
            'location' => $locationBits ? implode(', ', $locationBits) : 'Philippines',
            'budgetMin' => (float) ($tourRequest->budget_min ?? 0),
            'budgetMax' => (float) ($tourRequest->budget_max ?? ($tourRequest->budget_min ?? 0)),
            'duration' => (string) ($tourRequest->duration_label ?: 'Flexible'),
            'travelers' => (string) ($tourRequest->travelers_label ?: '1 traveler'),
            'interests' => array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, is_array($tourRequest->interests) ? $tourRequest->interests : []))),
            'status' => (string) $tourRequest->status,
            'statusBucket' => $statusBucket,
            'isActive' => (bool) $tourRequest->is_active,
            'selectedGuideId' => $tourRequest->selected_guide_id ? (string) $tourRequest->selected_guide_id : null,
            'selectedAt' => optional($tourRequest->selected_at)->toISOString(),
            'closedAt' => optional($tourRequest->closed_at)->toISOString(),
            'selectedGuideName' => $selectedGuide ? trim((string) $selectedGuide->name) : null,
            'selectedGuideAvatar' => $this->resolveAvatarPath($selectedGuide?->avatar_path),
            'comments' => $comments,
            'createdAt' => optional($tourRequest->created_at)->toISOString(),
            'updatedAt' => optional($tourRequest->updated_at)->toISOString(),
        ];
    }

    private function presentComments(TourRequest $tourRequest): array
    {
        if (!$this->hasTourRequestCommentsTable()) {
            return [];
        }

        $comments = $tourRequest->relationLoaded('comments')
            ? $tourRequest->comments
            : $tourRequest->comments()->with('author')->get();

        return $this->buildCommentTree(
            $comments,
            $tourRequest->selected_guide_id ? (string) $tourRequest->selected_guide_id : null
        );
    }

    private function buildCommentTree(Collection $comments, ?string $selectedGuideId = null): array
    {
        $normalized = $comments
            ->sortBy(function (TourRequestComment $comment) {
                $timestamp = (int) (optional($comment->created_at)->getTimestamp() ?? 0);

                return str_pad((string) $timestamp, 12, '0', STR_PAD_LEFT) . '-' . (string) $comment->id;
            })
            ->map(function (TourRequestComment $comment) use ($selectedGuideId) {
                $author = $comment->author;
                $authorRole = $this->resolveAuthorRole($comment->author_role, $author?->role);
                $authorId = $comment->author_id ? (string) $comment->author_id : null;

                return [
                    'id' => (string) $comment->id,
                    'requestId' => (string) $comment->tour_request_id,
                    'parentCommentId' => $comment->parent_comment_id ? (string) $comment->parent_comment_id : null,
                    'authorId' => $authorId,
                    'authorRole' => $authorRole,
                    'authorName' => trim((string) ($author?->name ?? ($comment->author_name ?: 'User'))),
                    'authorAvatar' => $this->resolveAvatarPath(
                        $author?->avatar_path
                            ?: $comment->author_avatar_url
                    ),
                    'guideId' => $authorRole === 'guide' ? $authorId : null,
                    'guideName' => trim((string) ($author?->name ?? ($comment->author_name ?: 'Guide'))),
                    'guideAvatar' => $this->resolveAvatarPath(
                        $author?->avatar_path
                            ?: $comment->author_avatar_url
                    ),
                    'text' => (string) ($comment->text ?? ''),
                    'offerAmount' => $comment->offer_amount !== null ? (float) $comment->offer_amount : null,
                    'createdAt' => optional($comment->created_at)->toISOString(),
                    'isSelectedGuide' => $authorRole === 'guide' && $selectedGuideId !== null && $authorId === $selectedGuideId,
                    'replies' => [],
                ];
            })
            ->values();

        $entries = [];
        $childrenByParent = [];

        foreach ($normalized as $entry) {
            $entryId = (string) ($entry['id'] ?? '');
            if ($entryId === '') {
                continue;
            }

            $entries[$entryId] = $entry;
            $parentKey = $entry['parentCommentId'] ? (string) $entry['parentCommentId'] : '__root__';
            if (!array_key_exists($parentKey, $childrenByParent)) {
                $childrenByParent[$parentKey] = [];
            }
            $childrenByParent[$parentKey][] = $entryId;
        }

        $buildNode = function (string $id) use (&$buildNode, $entries, $childrenByParent): array {
            if (!array_key_exists($id, $entries)) {
                return [];
            }

            $node = $entries[$id];
            $childIds = $childrenByParent[$id] ?? [];
            $node['replies'] = array_values(array_filter(array_map(function ($childId) use ($buildNode) {
                return $buildNode((string) $childId);
            }, $childIds)));

            return $node;
        };

        $rootIds = $childrenByParent['__root__'] ?? [];

        return array_values(array_filter(array_map(function ($rootId) use ($buildNode) {
            return $buildNode((string) $rootId);
        }, $rootIds)));
    }

    private function resolveAuthorRole(?string $commentRole, ?string $userRole): string
    {
        $normalizedCommentRole = strtolower(trim((string) $commentRole));
        if (in_array($normalizedCommentRole, ['tourist', 'guide'], true)) {
            return $normalizedCommentRole;
        }

        $normalizedUserRole = strtolower(trim((string) $userRole));
        if (in_array($normalizedUserRole, ['tourist', 'guide'], true)) {
            return $normalizedUserRole;
        }

        return 'guide';
    }

    private function hasTourRequestCommentsTable(): bool
    {
        if (self::$hasTourRequestCommentsTable === null) {
            self::$hasTourRequestCommentsTable = Schema::hasTable('tour_request_comments');
        }

        return self::$hasTourRequestCommentsTable;
    }

    private function resolveAvatarPath(?string $path): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return '/images/manila.jpg';
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }
}
