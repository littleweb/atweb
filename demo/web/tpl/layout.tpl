<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>{{title}}</title>
    <link rel="stylesheet" type="text/css" href="/css/{{name}}.css?t=%t%">
</head>
<body>
    {% block webapp %}{% endblock %}
    <script type="text/javascript" src="/js/{{name}}.js?t=%t%"></script>
</body>
</html>