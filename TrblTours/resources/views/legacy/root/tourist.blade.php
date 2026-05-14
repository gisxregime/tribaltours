<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url={{ route('explore') }}">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="{{ route('explore') }}">Explore Tours</a>...</p>
    <script>window.location.replace(@json(route('explore')));</script>
</body>
</html>
