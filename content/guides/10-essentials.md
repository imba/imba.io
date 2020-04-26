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

> In all the examples we include a minimal stylesheet inspired by [tailwind.js](https://tailwindcss.com/)

> Imba does not use a virtual DOM. The example above creates an actual native div element.

> The props are compiled directly to setters. Explain tabIndex and tabindex difference.

> Defining attributes - when it is needed?

### Properties

```imba
<input type="text" value="hello">
```

```imba
var data = {name: "jane"}
<input type="text" value=data.name>
```

### Classes
Classes are set with a syntax inspired by css selectors:
```imba
<div.font-bold> "Bold text"
```
Multiple classes are chained together:
```imba
<div.font-bold.font-serif> "Bold & serif text"
```
If you want to set classes only when some expression is true you can use conditional classes:
```imba
var featured = yes
var archived = no
<div .font-bold=featured .hidden=archived> "Bold but not hidden"
```

To set dynamic classes you can use `{}` interpolation:
```imba
var state = 'done'
var marks = 'font-bold'
var color = 'blue'

<div.p-2 .{marks} .{state} .bg-{color}-200> "Bolded with bg-blue-200"
```

### Children

Indentation is significant in Imba, and elements follow the same principles. We never explicitly close our tags. Instead, tags are closed implicitly by indentation. So, to add children to an element you simply indent them below:

```imba
<div>
	<ul>
		<li> 'one'
		<li> 'two'
		<li> 'three'
```
When an element only has one child it can also be nested directly inside:
```imba
<div> <ul>
	<li.one> <span> 'one'
	<li.two> <span> 'two'
	<li.three> <span> 'three'
```

## Conditionals and Loops

Since tags are first-class citizens in the language, logic works here as in any other code:
```imba
var seen = true
<div>
	if seen
		<span> "Now you see me"
	else
		<span> "Nothing to see here"
```

If we have a dynamic list we can simply use a `for in` loop:

```imba
const todos = [{title: "Eat"},{title: "Sleep"},{title: "Code"}]

<ul> for todo in todos
	<li.todo> <span.name> todo.title
```

Here's an example with more advanced logic:

```imba
const todos = [
	{title: "Eat", done: no}
	{title: "Sleep", done: no}
	{title: "Code", done: yes}
]

<div>
	for todo,i in todos
		# add a separator before every todo but the first one
		<hr> if i > 0 
		<div.todo .line-through=todo.done>
			<span.name> todo.title
			if !todo.done
				<button> 'finish'
```

> `for of` and `for own of` loops also supported for iteration

# Careless Rendering

- Mention how elements update / re-render
- Mounting an element vs mounting with a function
- Explain `imba.commit!`

Very important concept to grasp. 


## Rendering an Element into the DOM

```imba
imba.mount <div.main> "Hello World"
```

# Handling Events

> Explain why event syntax uses chaining like `click.{callback}` instead of `click=callback`

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

> Components can have local state since they are not virtual

# Web Components

Sometimes you will want to define custom reusable components. Custom imba tags compiles to web components.

## Declaring

> Naming rules for custom components
> Render method is optional
> Declaring properties
> Declaring attributes

```imba
tag my-component
	def render
		<self>
			<div.one.two title='hello'> "Hello there"
```

## What is `<self>`?

## Element References
```imba
tag app-example

	def submit
		$title
		console.log $title.value

	def render
		<self>
			<input$title type='text'>
			<button :click.submit> 'submit'

imba.mount <app-example>
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

## Sheduling components




# Styling

Info about styling here

## Scoped styles