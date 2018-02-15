# Tags

This one of the main differentiators of Imba. The language has native support for tags. Tags are in fact native DOM elements, with a very lightweight wrapper that provides additional functionality and extensibility. Tags has a separate class hierarchy.

> imba.io is written entirely in Imba, and the views are generated using tags. The same code is rendering both on the server and the client, using the same logic for routing etc. If you are interested, the sourcecode is publicly available at [github](https://github.com/somebee/imba.io).

In JavaScript you can create tags using `document.createElement('div')`. Tags are first-class citizens in Imba. To create a div you simply write `<div>`. You can look at tags in Imba as a native shorthand syntax for spawning html elements. As you will also learn, this syntax for creating tags support a css-like syntax for setting id,classes,events,attributes and more. `<div.red>` will create a div with class 'red'. `<div#main.one>` creates a tag with id 'main' and a class 'one'. Attributes are set like `<div.large tabindex=0 data-level=10>`. Here are a few more example of literal tags and their resulting HTML.

```imba
<div> 'Some text' # <div>Some text</div>
<div.red.blue>    # <div class='red blue'></div>
<div title='App'> # <div title='App'></div>
<b> <i> 'Coolio'  # <b><i>Coolio</i></b>
```

As you can see, tags are not explicitly closed, instead relying on indentation like the rest of Imba. This works for arbitrarily deep tag trees.

```imba
<ul.contributors>
    <li> 'Sindre Aarsaether'
    <li> 'Magnus Holm'
    <li> 'Slee Woo'
```

To browse through the available methods for tags, [check out the API](/docs#api-Imba_Tag__build)