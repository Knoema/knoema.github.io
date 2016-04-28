Add request to the template requests array in app.loadTemplates method:
```
var templates = [
    ...
    $.get('tmpl/some-template.html', compileTemplate)
];
```
Template will be available as:

```
$.tmpl('some-template.thml'`)
```