<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? config('app.name', 'TrblTours') }}</title>
    <x-meta-head />
    @stack('head')
</head>
<body>
    @include('partials.flash-status')
    @yield('content')
    @stack('scripts')
</body>
</html>
