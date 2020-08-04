---
title: Getting Started
multipage: true
---

# Overview

### What is Imba

Imba is a programming language for building web applications with insane performance. You can use it both for the server and client.

In Imba DOM elements *and* CSS are treated as first-class citizens. DOM elements are compiled to a [memoized DOM](/guides/advanced/performance), which is an [order of magnitude faster](https://somebee.github.io/dom-reconciler-bench/index.html) than todays virtual DOM implementations. 

This truly open opens up for a new way of developing web applications.

### Basic Syntax

##### Literals
```imba
let number = 42
let bool = yes
# strings
let string = 'the answer is 42'
let dynamic = "the answer is {number}"
let template = `the answer is {number}`

let regex = /answer is (\d+)/
let array = [1,2,3]
let object = {name: 'Imba', type: 'language'}

# objects can also be indented
let details =
    name: "Imba"
    version: 2.0
    repository: 'https://github.com/imba/imba'
    inspiration: ['ruby','python','react','coffeescript']
```

##### Methods
```imba
def method param
    console.log param
# default values
def method name = 'imba'
    console.log param
# destructuring parameters
def method name, {title, desc = 'no description'}
    console.log name,title,desc
```

##### Functions & Callbacks
```imba
[1,2,3,4].map do(item) item * 2
```

##### Class Declarations
```imba
class Todo
    prop title
    prop completed = no
    
    def complete
        completed = yes


let todo = new Todo 'Read introduction'
```

##### Loops & Iteration
```imba
# looping over arrays
for num,i in [1,2,3]
    num * 2
# looping over iterables
for chr of 'string'
    chr
# filtering
for num in array when num != 2
    num
```

##### Elements
> Elements are a native part of Imba just like strings, numbers, and other types.
```imba
# elements are first class citizens
const list = <ul title="reminders">
    <li> "Remember milk"
    <li> "Greet visitor"

# setting classes on elements:
<div.panel.large> "Hello world"
# setting dynamic and conditional classes:
<div.panel.state-{state} .hidden=condition> "Panel"
# binding handlers (with modifiers):
<div.panel @click.prevent=handler> "Panel"
```

##### Components
> Tags are compiled down to *extremely optimized* native web components.

```imba
import {todos} from './data.imba'

# ---
# Define custom reusable web components
tag todo-item
    <self .completed=data.completed>
        <input bind=data.completed type='checkbox'>
        <span.title> data.title
        <button @click.stop.emit('remove')> 'x'

tag todo-app
    <self> for todo in data
        <todo-item data=todo>

imba.mount <todo-app data=todos>
```

##### Inline styles
```imba
import {todos} from './data.imba'

# ---
# inline styles
<div[position:relative display:flex flex-direction:row]>
# conditional styles based on pseudostates
<div[opacity:0.5 @hover:1]>
# conditional styles based on media queries
<div[padding:3rem @lg:5rem @print:0]>

```

##### Scoped Styles
```imba
import {todos} from './data.imba'

tag todo-app
    css .item color:gray8 bg@hover:gray1
    css .item.done color:green8 text-decoration: line-through
    
    def render
        <self> for todo in data
            <div.item .done=data.completed> <span> data.title
```

##### Global Styles
```imba
css .button
    padding: 1rem 2rem
    color:gray7
    border: 1px solid gray2
    radius: 3px
    &.blue bg:blue5 color:white bg@hover:blue6
    &.teal bg:teal5 color:white bg@hover:teal6

<div>
    <div.button.blue> "Blue button"
    <div.button.teal> "Teal button"
```

##### Decorators

```imba
import {watch} from './decorators.imba'

# ---
class Reminder
    @watch prop completed

    def completedDidSet value
        console.log('completedDidSet', value)
```

##### Type annotations

> Type annotations in imba are compiled to jsdoc comments and are used for intelligent auto-completions and analysis in Visual Studio Code.
```imba
let item\string = window.title

def multiply a\number, b\number
    a * b
```

# Installation

TODO(alexander)