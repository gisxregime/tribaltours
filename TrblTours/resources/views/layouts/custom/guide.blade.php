@extends('layouts.custom.app')

@php($title = $title ?? 'Guide Workspace | Tribaltours')

@push('head')
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    @vite(['resources/assets/styles.css'])
@endpush

@section('content')
    @yield('guide-content')
@endsection
