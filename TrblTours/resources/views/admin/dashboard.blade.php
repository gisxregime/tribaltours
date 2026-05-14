@extends('layouts.custom.app')

@php($title = 'Admin Dashboard | TrblTours')

@push('head')
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
@endpush

@section('content')
    <div class="content-wrap" style="max-width: 1200px; margin: 0 auto; padding: 2rem 1rem;">
        <section class="page-header">
            <h1 class="page-title">Admin Dashboard</h1>
            <p class="text-muted">Operational overview for TrblTours moderation and platform health.</p>
        </section>

        <section class="stats-row guide-dashboard-stats mt-3">
            <article class="stat-card"><p class="text-muted small">Users</p><p class="value">{{ number_format($adminStats['users_total'] ?? 0) }}</p></article>
            <article class="stat-card"><p class="text-muted small">Pending Guide Verification</p><p class="value" style="color:#8f6512;">{{ number_format($adminStats['guides_pending_verification'] ?? 0) }}</p></article>
            <article class="stat-card"><p class="text-muted small">Published Tours</p><p class="value" style="color:#1f5fa6;">{{ number_format($adminStats['active_listings'] ?? 0) }}</p></article>
            <article class="stat-card"><p class="text-muted small">Bookings</p><p class="value" style="color:#0f766e;">{{ number_format($adminStats['bookings_total'] ?? 0) }}</p></article>
            <article class="stat-card"><p class="text-muted small">Open Reports</p><p class="value" style="color:#9f1239;">{{ number_format($adminStats['open_reports'] ?? 0) }}</p></article>
        </section>
    </div>
@endsection
