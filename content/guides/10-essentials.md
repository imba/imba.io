---
title: Essentials
multipage: true
---

# Syntax

Basic syntax stuff about the language

# Elements

```imba
let element = <div.main> "Hello"
```

The above declaration might look strange at first. DOM elements are first-class citizens in Imba. We are creating a *real* dom element, with the className "main" and textContent "Hello".

Let's break down the basic syntax before we move on to more advanced examples. Since setting classes of elements is very common, imba has a special shorthand syntax for this. You declare classes by adding a bunch of `.classname` after the tag type. You can add multiple classes like `<div.large.header.primary>`. Can you guess how to set the id of a tag? It uses a similar syntax: `<div#app.large.ready>`.

> Imba does not use a virtual DOM. The example above creates an actual native div element.

## Setting properties

## Setting classes

## Setting dynamic classes

## Setting conditional classes

### Adding children

You might notice that we never close our tags. Rather than being delimited by curly braces or “begin/end” keywords, blocks are delimited by indentation, and so are tags. This might seem weird in the beginning, but it makes for very readable and concise code. So, if we want to create a list with some children, we simply go:

```imba
<ul>
    <li> "Understand indentation"
    <li> "Get used to it"
    <li> "Cherish it"
```

# Rendering

- Mention how elements update / re-render


## Rendering an Element into the DOM

```imba
imba.mount <div.main> "Hello World"
```


## Nested trees

## Conditional rendering

## List rendering

You might notice that we never close our tags. Rather than being delimited by curly braces or “begin/end” keywords, blocks are delimited by indentation, and so are tags. This might seem weird in the beginning, but it makes for very readable and concise code. So, if we want to create a list with some children, we simply go:

```imba
<ul>
    <li> "Understand indentation"
    <li> "Get used to it"
    <li> "Cherish it"
```

If we have a dynamic list we can simply use a `for in` loop:

```imba
<ul> for activity in ["Eat", "Sleep", "Code"]
    <li> <span.name> activity
```


Hello there

# Handling Events

## Listening to Events

We can use `<tag :eventname.{expression}>` to listen to DOM events and run `expression` when they’re triggered.

```imba
var counter = 0
imba.mount do
    <div.app>
        <button :click.{counter++}> "Increment"
        <div> "count is {counter}"
```

In the example above we declared the handler inline. Usually it is better to define the handlers outside of the view, and decouple them from the event itself. This can be done in several ways.


## Event Modifiers

Inspired by vue.js, Imba also supports modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers never need to know about the event in the first place.

```
# call preventDefault on the submit-event, then call doSomething
<form :submit.prevent.doSomething>
```

> What is the difference between a modifier and a handler in this case? There isn't really a difference. In fact, the modifiers are implemented as methods on element, and you can define custom modifiers as well.

* `.stop` - stops event from propagating
* `.prevent` - calls preventDefault on event
* `.silence` - explicitly tell Imba not to broadcast event to schedulers
* `.self` - only trigger subsequent handlers if event.target is the element itself

### Key Modifiers

For keyboard events (keydown, keyup, keypress) there are also some very handy modifiers available.
```
# trigger addItem when enter is pressed
<input type='text' :keydown.enter.addItem>

# multiple handlers for the same event is allowed
# trigger gotoPrev/gotoNext when pressing up/down keys
<div :keydown.up.gotoPrev :keydown.down.gotoNext>
```
 
* .left
* .right
* .up
* .down
* .enter
* .tab
* .esc
* .space
* .del

### System Modifier Keys

* .ctrl
* .alt
* .shift
* .meta


```
# only trigger when ctrl is pressed
<button :click.ctrl.myHandler>

# only trigger when shift is pressed
<button :click.shift.myHandler>

# the order of modifiers matters;
# always prevent default action, but only trigger myHandler if alt as pressed
<button :click.prevent.alt.myHandler>
```

### Mouse Button Modifiers

* .left
* .right
* .middle

## Declaring default handlers

When an event is processed by Imba, it will also look for an `on(eventname)` method on the tags as it traverses up from the original target.

```
tag App
    def onsubmit e
        e.prevent
        window.alert('Tried to submit!')

    def render
        <self>
            <form>
                <input type='text'>
                <button type='submit'> "Submit"

Imba.mount <App>
```


## Custom events

#### `tag.emit(name, data = null)`

Custom events will bubble like native events, but are dispatched and processed directly inside the Imba.Event system, without generating a real browser Event. Optionally supply data for the event in the second argument. Here is a rather complex example illustrating several ways of dealing with custom events

```imba
const todos = [
    {title: "Remember milk", done: false}
    {title: "Test custom events", done: false}
]

def toggleTodo todo
    todo.done = !todo.done

def renameTodo todo
    todo.title = window.prompt("New title",todo.title)

imba.mount do
    <ul.todos> for item in todos
        <li.todo .done=item.done>
            <span :click.{toggleTodo(item)}> item.title
            <button :click.{renameTodo(item)}> 'rename'
```

# Binding Data

Hello there bindings

# Managing State

# Web Components

Sometimes you will want to define custom reusable components. Custom imba tags compiles to web components.

## What is `<self>`?


# Styling

Info about styling here