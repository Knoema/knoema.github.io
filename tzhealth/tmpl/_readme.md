Each template should be wrapped to the root element with "data-template-name" attribute. This attribute should contain
name of the template file (just to keep things simple). Root element needed to get template name from template raw data
after loading it asynchronously.

This how it should be done:

```
<div data-template-name="article-template.html">
    <h1>${article.title}</h1>
    <p>${article.content}</p>
</div>
```

And you can use it like this:

```
$.tmpl('article-template.html', {
    article: {
        title: 'Some title',
        content: 'Some content'
    }
}).appendTo($('body'));
```
