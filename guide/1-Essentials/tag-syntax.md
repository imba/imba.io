---
title: Tag Syntax
order: 2
---

# Tag Syntax

## Instantiating Tags

```imba
let element = <div.main> "Hello"
```

The above declaration might look strange at first. DOM elements are first-class citizens in Imba. We are creating a *real* dom element, with the className "main" and textContent "Hello".

Let's break down the basic syntax before we move on to more advanced examples. Since setting classes of elements is very common, imba has a special shorthand syntax for this. You declare classes by adding a bunch of `.classname` after the tag type. You can add multiple classes like `<div.large.header.primary>`. Can you guess how to set the id of a tag? It uses a similar syntax: `<div#app.large.ready>`.


## Conditional Classes

One very common need when developing web apps is to set a className only when some condition is true. Imba has a shorthand syntax for this too:

```imba
# only add 'ready' class if expression is truthy
<div.header .ready=expression>
```


## Dynamic classes

What about setting fully dynamic classes? E.g. if state is a variable containing a string, you can set it like this;

```imba
let state = "busy"
let element = <div.header .{state}>
```


## Setting inline styles

```imba
<div css:display='block' css:color='red'>
```


## Setting custom data

When we move on to custom tags, you will find that tags very often represent some data.

```imba
<AppView[myData] title="Application">
```


## Rendering Lists

You might notice that we never close our tags. Rather than being delimited by curly braces or “begin/end” keywords, blocks are delimited by indentation, and so are tags. This might seem weird in the beginning, but it makes for very readable and concise code. So, if we want to create a list with some children, we simply go:

```imba
let list = <ul>
    <li> "Understand indentation"
    <li> "Get used to it"
    <li> "Cherish it"
```

If we have a dynamic list we can simply use a `for in` loop:

```imba
let activities = ["Eat", "Sleep", "Code"]
let list = <ul>
    for activity in activities
        <li> <span.name> activity
```

## Conditional Rendering

```imba
let app = <div>
    if isLoggedIn
        <a href="/logout"> "Log out"
    else
        <a href="/register"> "Register"
```

## Reactive Rendering

As we explain custom tags, you will learn that everything inside `<self>` is reactive by default. Ending a tag with  `->` or `=>` instead of `>` marks it as reactive, and allows you to call `render` on the tag to re-render the content.

```imba
var number = 0

var dead = Imba.mount <div>
    <span> "Dead time is {Date.new.toLocaleString}"
    <span> "Number is {number}"

var live = Imba.mount <div ->
    <span> "Live time is {Date.new.toLocaleString}"
    <span> "Number is {number}"

setInterval(&,1000) do
    number++
    dead.render # nothing changes
    live.render # content is updated
```

## Rendering into document

To add tags to the actual document, you should use `Imba.mount(element, into)`. If you do not supply a second argument, the element will be added to document.body by default.

```
Imba.mount <div -> <span> "Let's get started!"
```

