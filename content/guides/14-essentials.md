---
title: Essentials
multipage: true
---

# Language

Basic syntax stuff about the language

## Basics

### Indentation
Imba is an Indentation based language. What that means is that nesting of objects and elements is created by the indentation level, rather than by curly braces and opening and closing tag pairs. 

Here are some of the benefits.

- You will write your app a lot faster.
- Your code will be more legible.
- It will write a lot less lines of code.

For example, here's some HTML using opening and closing brackets

```
// HTML
<header>
	<h1> Hello World! </h1>
</header>
```
Here's the same template in Imba.
```
// IMBA
<header>
	<h1> "Hello world!"
```
That's a **30%** decrease in lines of code and a **52%** less characters of code (excluding text) in just that tiny example. Imba will compile to the same HTML as above, but why not spare yourself all that writing?

If you have ever used an indented language like ruby, python, or pug, we're sure you will soon find it hard to live without. 

> Our compiler is optimized for using tabs for indentation, so be sure to switch your editor to use tabs. If on VS Code type `CMD/CTRL + SHIFT + P` and search to find "Convert Indentation to Tabs", then click on it. You may be asked to choose number of spaces for your indentation. That is your personal choice.

### Implicit self
<!-- TODO: UPDATE / VERIFY -->
In imba, self is implicit within any given *Tag* or class. 
```
let user = "Joe"
tag app-root
	prop language = "Imba"
	def render
		<self> 
			<h1> this.language // this works, but it's not needed
			<h1> language // do this instead
			<h2> user // global variables will be found as well.

```
## Strings
Strings in imba are no different than strings in Javascript. 
You may use single quotes or double quotes. 
Just be aware that interpolation within a string can only happen with double quotes.
```
let user = "Joe"
<h1> 'Hi {user}, this is a string'
// Compiles to: <h1> Hi {user}, this is a string </h1>

<h1> "Hi {user}, this is a string"
// Compiles to: <h1> Hi Joe, this is a string </h1>
```
## Numbers

## Regular Expressions

## Functions
There are two types of functions in Imba.
- Function Declarations (aka methods)
- Function Expressions (aka. function blocks)

Functions can operate within three different scopes
- Global
- Class instance
- Tag instance
By defining a function outside of classes or tags, they will be accessible in globally.

A *function* is defined with the `def` keyword
```
def methodName
	Math.Random()
```
If the function is defined at the root level of a document, it will be a global function accessible with the following syntax.
```
def functionName(argumentName)
	console.log argumentName * 2
functionName(2)
>>> 4
```
Optionally, if you are not passing any arguments to your function you can simply use the `!` instead of `()` to call the method.

```imba
def functionName
	console.log "Function has been called!"
methodName! // Optional syntax for calling functions, if you are not passing any arguments
>>> Function has been called!
```

## Class Methods
Methods are simply functions that are scoped to each instance of a Class, so everything that applies to functions, applies here. The only difference is that to access the methods of a class, you need to create an instance of class like this.
```imba
class Random
	def randomize
		console.log Math.random!
let lucky = new Random
```
Now we have an instance of random in an object called lucky.
To access the method we use the following syntax `.randomize!`
[link to classes](/guides/essentials/language/##classes)



methods, those methods will be accessible from that object. [Learn more about **Classes** here.](https://app.gitbook.com/@imba/s/guide/logic-and-data/classes-1)
<!-- TODO: update this link -->

Here's an example of instantiationg a class into the lucky object, and then accesing the randomize method from within the lucky object.

```
class Random
	def randomize
		Math.random!
let lucky = Random.new
console.log lucky.randomize!
```

### Function Expressions {#function-expressions}

Function expressions are also called function blocks, and in the ES6, they are also implemented as arrow functions.

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

### Styling

```imba
<div.(font-weight:700)> "Bold text"
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
import {todos} from './data.imba'

# ---
<ul> for todo in todos
	<li.todo> <span.name> todo.title
```

Here's an example with more advanced logic:

```imba
import {todos} from './data.imba'

# ---
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

# Components

[Article](/articles/components.md)


# Rendering

- Mention how elements update / re-render
- Mounting an element vs mounting with a function
- Explain `imba.commit!`

Very important concept to grasp. 


## Rendering an Element into the DOM

```imba
imba.mount <div.main> "Hello World"
```

# Handling Events

[Article](/articles/events.md)

# Binding Data

[Article](/articles/binding-data.md)

# Managing State

[Article](/articles/managing-state.md)
