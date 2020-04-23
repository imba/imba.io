---
title: Essentials
multipage: true
---

# Language

Basic syntax stuff about the language

## Basics

### Indentation

### Implicit self

## Strings

## Numbers

## Regular Expressions

## Functions

## Classes

## Control Flow

### if

### elif

### switch

### try/catch

## Loops and Iteration

### for in

### for of

### for own of

### while

### until

## Import and Export

## Async and Await

## Decorators

## Elements

## Expressions

Conditionals and loops are also expressions

# Elements

```imba
let element = <div.main> "Hello"
console.log 'Hello there'
```

The above declaration might look strange at first. DOM elements are first-class citizens in Imba. We are creating a *real* dom element, with the className "main" and textContent "Hello".

Let's break down the basic syntax before we move on to more advanced examples. Since setting classes of elements is very common, imba has a special shorthand syntax for this. You declare classes by adding a bunch of `.classname` after the tag type. You can add multiple classes like `<div.large.header.primary>`. Can you guess how to set the id of a tag? It uses a similar syntax: `<div#app.large.ready>`.

> Imba does not use a virtual DOM. The example above creates an actual native div element.

> Elements are not explicitly closed. Follows indentation

## Setting properties & classes

```imba
var highlight = true
var color = 'blue'
var name = 'Example'
var state = 'ready'

imba.mount do <section title=name>
    # Setting plain properties
    <input type='text' placeholder='Your name...'>
    # Setting classes
    <div.font-bold> "Bold text"
    # multiple classes
    <div.font-bold.font-serif.p-2> "Bold, serif & padded"
    # Conditional classes
    <div .font-bold=highlight> "Bold if highlight == true"
    <div .font-bold=!highlight> "Bold if highlight == false"
    # Dynamic classes
    <div .state-{state}> "Box with {color} text - in state {state}"
    <div .text-{color}-500 .{state}> "Box with {color} text - in state {state}"
```

### Adding children

You might notice that we never close our tags. Rather than being delimited by curly braces or “begin/end” keywords, blocks are delimited by indentation, and so are tags. This might seem weird in the beginning, but it makes for very readable and concise code. So, if we want to create a list with some children, we simply go:

```imba
<ul>
    <li> "Understand indentation"
    <li> "Get used to it"
    <li> "Cherish it"
```

# Careless Rendering

- Mention how elements update / re-render
- Mounting an element vs mounting with a function
- Explain `imba.commit!`


## Rendering an Element into the DOM

```imba
imba.mount <div.main> "Hello World"
```


## Nested trees

## Conditional rendering

## List rendering

You might notice that we never close our tags. Rather than being delimited by curly braces or “begin/end” keywords, blocks are delimited by indentation, and so are tags. This might seem weird in the beginning, but it makes for very readable and concise code. So, if we want to create a list with some children, we simply go:

```imba
imba.mount do
    <ul>
        <li> "Understand indentation"
        <li> "Get used to it"
        <li> "Cherish it"
```

If we have a dynamic list we can simply use a `for in` loop:

```imba
const activities = ["Eat","Sleep","Code"]

imba.mount do
    <ul> for activity in activities
        <li> <span.name> activity
```

## Dynamic element types

```imba
let items = [
    type: 'todo'
    title: 'My task'
    ---
    type: 'note'
    title: 'My note'
]

tag todo-item
    <self> "Todo: {data.title}"

tag note-item
    <self> "Note: {data.title}"

imba.mount do
    <ul> for item in items
        <li> <{item.type}-item data=item>

```

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

## Event Modifiers

Inspired by vue.js, Imba also supports modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers never need to know about the event in the first place.

```
# call preventDefault on the submit-event
<form :submit.prevent.doSomething>
```

#### prevent
```imba
# calls preventDefault on event
<button :click.prevent.{'doSomething'}>
```

### stop

stops event from propagating

### self

only trigger subsequent handlers if event.target is the element itself

### silence

explicitly tell Imba not to broadcast event to schedulers

### keys

For keyboard events (keydown, keyup, keypress) there are also some very handy modifiers available.
```
# trigger addItem when enter is pressed
<input type='text' :keydown.enter.{addItem}>

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

## Unresolved Modifiers

## Special Events

### resize

### selection

### mutate

### intersect

## Custom events

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

## Examples

```imba
let x = 0
let y = 0

imba.mount do
	<div.absolute.inset-0 :mousemove.{{x,y} = e}>
		<div> "mouse is at {x},{y}"
```

# Binding Data

- Show that we can bind to both variables and properties
- Basic syntax for binding `<element[value-to-bind]>`
- How to expose binding

## Text inputs

```imba
let message = "Hello"

imba.mount do <>
    <input[message].field type='text'>
    <div> "Message is {message}"
```

## Numeric inputs

```imba
let number = 1
let object = {number: 2}

imba.mount do <>
	<label.flex.flex-row>
		<input[number].field type='number' min=0 max=10>
		<input[number].field type='range' min=0 max=10>
	<label.flex.flex-row>
		<input[object.number].field type='number' min=0 max=10>
		<input[object.number].field type='range' min=0 max=10>
	<div.field> "{number} + {object.number} = {number + object.number}"
```

## Checkbox inputs
```imba
const state =
    message: ""
    enabled: false

imba.mount do
    <label>
        <input[state.enabled] type='checkbox'>
        <span> "enabled: {state.enabled}"
```

## Radio inputs

## Select

## Select multiple

## Custom binding

# Managing State

> Not like most frameworks. You dont really manage it.

# Web Components

Sometimes you will want to define custom reusable components. Custom imba tags compiles to web components.

## Declaring

> Naming rules for custom components
> Render method is optional

```imba
tag my-component
    def render
        <self>
            <div.one.two title='hello'> "Hello there"
```

## What is `<self>`?

## Referencing elements

## Sheduling components


# Styling

Info about styling here

## Scoped styles