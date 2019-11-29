---
title: Tags
---

# tags

## Basics

This one of the main differentiators of Imba. The language has native support for tags. Tags are in fact native DOM elements, with a very lightweight wrapper that provides additional functionality and extensibility.

```text
var title = <h1> 'This is a title'

# id and classes can be set using a css/haml-like syntax
var main = <div#main.red.large title='welcome'> 'Main div'

# tags can naturally be nested using indentation
var list = <ul.products>
    <li> 'Milk'
    <li> 'Coolaid'
    <li> 'Bacon'

# and be referenced in other tag trees
var app = <div#app>
    <header> title
    <section> list
```

### Setting classes

```text
<div.one.two.three>

# you can also toggle a flag dynamically.
# this div only has the class 'red' if isUrgent is truthy
<div.one.two .red=isUrgent>
```

### Setting attributes

```text
<div title='Example' tabindex=0 data-name='ok'>
```

### Setting event handlers

```text
<div :tap='save'> 'Tap me to save'
```

## Defining

Tags are basically a separate Class hierarchy with syntactic sugar for instantiating nodes. All html elements are predefined, but you can also extend these tags, or inherit from them with your own tags. The syntax for creating new tags is very similar to our class syntax.

#### Inheriting from canvas

```text
tag sketchpad < canvas

    def ontouchstart touch
        yes

# Now you can spawn this tag like any other
var pad = <sketchpad width=500 height=300>
#app.append pad
```

#### Inherit from li

```text
tag entry < li
tag group < entry
tag project < entry
tag task < entry
```

### Cascading inheritance

Custom tags still use native supported node types in the DOM tree. Our `<sketchpad>` will render as a `<canvas class='_sketchpad'>` in the DOM, while `<task>` will render as `<li class='_entry _task'>`. This means that css/styling can also be inherited, and we can use query selectors to select all entries \(including inherited tags project and task\).

### Selectors

Selectors are also a native part of Imba. There are 4 shorthands.

```text
$(query)  # document.querySelectorAll(query)
$$(query) # document.querySelector(query)
%(query)  # (self|scope).querySelectorAll(query)
%%(query) # (self|scope).querySelector(query)

$(task) # selects all task-tags globally
$$(task.completed) # selects the first completed task

tag post

    def focus
        # hide all posts except this
        for post in $(post)
            post.flag('hidden', post != self)

    def comments
        %(comment).size # count comment tags inside this
```

