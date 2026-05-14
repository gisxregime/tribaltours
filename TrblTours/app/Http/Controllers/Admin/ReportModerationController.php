<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ReportModerationController extends Controller
{
    public function index(): View
    {
        $reports = Report::query()->with(['reporter', 'targetUser', 'resolver'])->latest()->paginate(30);
        return view('dashboard', ['reports' => $reports]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('admin.reports.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('admin.reports.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report): View
    {
        return view('dashboard', ['report' => $report->load(['reporter', 'targetUser', 'resolver'])]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Report $report): RedirectResponse
    {
        return redirect()->route('admin.reports.show', $report);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Report $report): RedirectResponse
    {
        $payload = $request->validate([
            'status' => ['required', 'in:open,investigating,resolved,dismissed'],
            'details' => ['nullable', 'string'],
        ]);

        if (in_array($payload['status'], ['resolved', 'dismissed'], true)) {
            $payload['resolved_by'] = $request->user()->id;
            $payload['resolved_at'] = now();
        }

        $report->update($payload);

        return back()->with('status', 'Report status updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Report $report): RedirectResponse
    {
        $report->delete();
        return back()->with('status', 'Report removed.');
    }
}
