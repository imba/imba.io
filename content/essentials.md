---
title: Essentials
multipage: true
---

# Introduction

## What is Imba? [slug=what]

## Why Imba? [slug=why]

# Basic Types [slug=types]

## Strings
## Numbers
## Arrays
## Objects
## Booleans
## Null & Undefined [slug=null]
## Regular Expressions [slug=regexes]
## Ranges

# Variables

## Declarations

## Constants

## Scoping

## Globals

# Operators

## Arithmethic Operators [slug=arithmetic]

## Logical Operators [slug=logical]

## Comparisons

## Assignments

## Bitwise Operators [slug=bitwise]

# Control Flow

## Conditional Statements

##### if [snippet]
```imba
# indented
if condition
    console.log 'yes!'
```
> The if statement executes the indented code if a specified condition is truthy.

##### else [snippet]
```imba
if condition
    console.log 'yes!'
else
    console.log 'no!'
```
> If the condition is falsy, code inside the connected else block will execute.

##### elif [snippet]
```imba
if expr > 10
    console.log 'over 10'
elif expr > 5
    console.log 'over 5'
elif expr
    console.log 'not falsy'
```
> To conveniently chain multiple conditionals, use `elif`. No `elif` or `else` statements will be executed after the first truthy condition.



##### unless [snippet]
```imba
unless condition
    console.log 'condition was not truthy'
```
> The unless statement executes the indented code if a specified condition is *not* truthy.


##### ternary [snippet]
```imba
condition ? console.log('yes!') : console.log('no!')
```
> The [Ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) is a useful way to write compact if / else statements.


##### trailing if & unless [snippet]
```imba
console.log 'yes' if condition
console.log 'no' unless condition
```
> If & unless can also be used at the end of a single line expression

##### switch [snippet]

```imba
switch value
when 10
    yes
when 5
    no
else
    throw 'nope'
```

## Loops and Iteration

##### for in [snippet]
```imba
let ary = [1,2,3]
for num,index in ary
    console.log num * index
```
Basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`

### For..of

The for...of statement creates a loop iterating over iterable objects, including: built-in String, Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map, Set, and user-defined iterables. This maps directly to `for of` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) with a few convenient additions.

##### for of [snippet]
```imba
let iter = new Set([1, 2, 3])
for value of iter
    value
```
Iterating over iterable objects following the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) added in ES2015. 

##### for own of [snippet]
```imba
let obj = {a:1, b:2, c:3}
for own key,value of obj
    "{key} is {value}"
```
Convenient syntax for looping through key-value pairs of objects.

##### while [snippet]
```imba
let ary = [1,2,3]
while let item = ary.pop!
    console.log item
```
Executes repeatedly as long as condition is truthy.

##### until [snippet]
```imba
let ary = [1,2,3]
until ary.length == 0
    console.log ary.pop!
```
Executes repeatedly until condition is truthy.

## Async and Await

Any method using an await in imba will automatically be compiled as an async method, so the `async` keyword is not needed (nor supported) in imba.

##### basic await [snippet]
```imba
def load
    let items = await long-lasting-task!
    return items
```

##### await in loop [snippet]
```imba
def load
    let items = for url in urls
        let req = await global.fetch(url)
        await req.json!
    console.log items
```

## Error Handling

# Functions

# Classes

### Constructors

### Methods

### Accessors

#### Getters

You can add dynamic / computed properties to your class instances using the `get` keyword followed by the name of the property.

```imba
class Rectangle
    # ...
    get area
        width * height
```

#### Setters
You can define setters which are to be called whenever there is an attempt to set that property.
```imba
class Rectangle
    # ...
    set sides value
        width = value
        height = value
```

### Fields

###### Dynamic Fields
```imba
class Example
    [name] = 100
```

### Instances

Instances

## Inheritance

Hello there


# Elements

## Basic Elements [slug=basics]

### Adding Properties [slug=props]

### Setting Classes [slug=classes]

You can add classes to your elements by adding one or more identifiers preceded by `.` to your tags
```imba
# add note and editorial classes
<div.note.editorial> "Hello"
```
Setting a class only when a certain condition is met can be done using `.class=condition`.
```imba
<div.note.editorial .resolved=data.isResolved> "Hello"
```
When you want to add dynamic classes based on data you can use `{}` for interpolation inside class names:
```imba
let marks = 'rounded important'
let state = 'done'
let color = 'blue'
# ---
<div.item .{marks} .{state} .bg-{color}-200> "Hello"
```
These interpolated classes can also be toggled by a condition:
```imba
<div.item .theme-{user.theme}=app.loggedIn> "Hello"
```

### Binding Events [slug=events]

### Mounting & Updating [slug=mounting]

## Conditional Rendering [slug=conditional]

## Rendering Lists [slug=lists]

## Custom Elements [slug=components]

### Local Components

### Web Components

### Named Elements

### Component Slots



## Event Handling [slug=events]

### Event Modifiers

### Handling Touches

### Intersect & Resize

## Form Input Bindings [slug=bindings]


##### text
```imba
# ~preview=md
import 'util/styles'

# ---
let message = "Hello"

imba.mount do <section>
	<input type='text' bind=message>
	<label> "Message is {message}"
```

##### textarea
```imba
# ~preview=md
import 'util/styles'

# ---
let tweet = ''

imba.mount do <section>
	<textarea bind=tweet placeholder="What's on your mind...">
	<label> "Written {tweet.length} characters"
```

##### range
```imba
# ~preview=md
import 'util/styles'

# ---
let point = {r:0, x:0}

imba.mount do <section[gap:2]>
    <input type='range' bind=point.x>
    <input type='range' bind=point.r>
    <label[js:center w:40px rotate:{point.r}deg x:{point.x}]> "{point.x},{point.r}"
```

##### number
```imba
# ~preview
import 'util/styles'

# ---
let a=1, b=2

imba.mount do <div.group>
    <input type='number' min=0 max=100 bind=a/> " + "
    <input type='number' min=0 max=100 bind=b/> " = "
    <samp> "{a + b}"
```

##### checkbox
```imba
# ~preview
import 'util/styles'
# ---
let bool=no

imba.mount do <section>
    <label>
        <input[mr:1] type='checkbox' bind=bool />
        <span> "Enabled: {bool}"
```
##### checkbox with array
```imba
# ~preview
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let options = ['React','Vue','Imba','Svelte','Ember']
let interests = []

imba.mount do <section>
    <div> for option in options
        <label[mr:2]>
            <input type='checkbox' bind=interests value=option/>
            <span[pl:1]> option
    <label> "Interested in {interests.join(', ')}"
```

##### radio
```imba
# ~preview
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let options = ['React','Vue','Imba','Svelte','Ember']
let interest = 'Imba'

imba.mount do <section>
    <div> for option in options
        <label[mr:2]>
            <input type='radio' bind=interest value=option/>
            <span[pl:1]> option
    <label> "Interested in {interest}"
```

##### select
```imba
# ~preview=md
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let options = ['React','Vue','Imba','Svelte','Ember']
let focus = 'Imba'

imba.mount do <section>
    <select bind=focus> for item in options
        <option value=item> item
    <label> "Focused on {focus}"
```

##### multiselect
```imba
# ~preview=lg
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
import {projects} from 'util/data'

let choices = []

imba.mount do <section>
    <select multiple bind=choices> for item in projects
        <option value=item> item.name
    <label> "Interested in"
    <div> for item in choices
        <div[color:{item.color}]> item.name
```

##### button
```imba
# ~preview=md
import {genres} from 'imdb'
import 'util/styles'

# ---
let state = 'one'
css button.checked shadow:inset bg:gray2 o:0.6

imba.mount do <section>
    <div.group>
        <button bind=state value='one'> "one"
        <button bind=state value='two'> "two"
    <label> "State is {state}"
```
> Buttons bound to data behave just like checkboxes. A `checked` class indicates when their value matches the bound data. Clicking a button multiple times will toggle just like a checkbox.

##### custom elements
```imba
# ~preview=lg
import 'util/styles'

# ---
let options = {
    width: 12
    height: 12
    title: 'Something'
}

tag Field
    get type
        typeof data == 'number' ? 'range' : 'text'

    <self[d:flex js:stretch]>
        <label[w:80px]> <slot> 'Field'
        <input[flex:1] type=type bind=data>

imba.mount do <section>
    <Field bind=options.title> 'Title'
    <Field bind=options.width> 'Width'
    <Field bind=options.height> 'Height'
    <label> "{options.title} is {options.width}x{options.height}"
```

##### combination
```imba
# ~preview=xl
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let people = [{name: 'Jane Doe', interests: ['Imba']}]
let person = people[0]

def addPerson
    person = {name: 'John',interests:[]}
    people.push(person)

def addInterest e
    person.interests.push e.target.value
    e.target.value = ''

imba.mount do <main>
    <header>
        <select bind=person>  for item in people
            <option value=item> item.name
        <button[ml:2] @click=addPerson> 'Add'
    <article>
        <label[ta:left]> "Editing {person.name}:"
        <input bind=person.name placeholder="Name...">
        <input placeholder="Add interest..." @keyup.enter.prevent=addInterest>
        <div.tags> for item in person.interests
            <button[mr:1].chip bind=person.interests value=item> item
```

## Routing

## State Management

## Lifecycle Hooks [slug=lifecycle]

## Advanced Concepts

### Element Context [slug=context]

### Memoization

# Styles

## Declarations [slug=rules]

```imba
css .btn
    position: relative
    display: block
    background: #b2f5ea
    padding-left: 4px
    padding-right: 4px

css .btn@hover
    background: #81e6d9
```
Styles are declared using the `css` keyword. Besides using indentation instead of `{}`, making `;` optional, and using `@pseudo` instead of `:pseudo` it looks like regular css. Line breaks are also optional. The following few snippets might look messy at first glance, but bear with us.

```imba
css .btn
    display:block background:#b2f5ea padding-left:4px padding-right:4px
css .btn@hover
    background: #81e6d9
```
We firmly believe that less code is better code, so we have strived to make the styling syntax as concise yet readable as possible. There is a case to be made against short variable names in programming, but css properties are never-changing. Imba provides intuitive abbreviations for oft-used css properties, as well as additional properties covering common usecases:
```imba
css .btn
    d:block pl:4px pr:4px bg:#b2f5ea
css .btn@hover
    bg:#81e6d9
```
We also want to make it easy to follow a consistent design system throughout your project while not enforcing a predefined look and feel. Imba provides default (but configurable) colors, fonts, size units and more to help enforce consistency:
```imba
css .btn
    d:block px:1 bg:teal2
css .btn@hover
    bg:teal3
```
Rules can also be written on a single line
```imba
css .btn d:block px:1 bg:teal2
css .btn@hover bg:teal3
```

There are also some patterns that come up again and again in css. Changing a few properties on `hover` or other states, or setting certain dimensions for specific screen sizes etc. Imba got you covered with property modifiers that we will get into later. But to round up, the first block of css here would usually be written like this in Imba:
```imba
css .btn d:block px:1 bg:teal2 bg@hover:teal3
```
This conciseness comes especially handy when declaring inline styles, which we will come back to later.

Styles can also be nested. Everything before the first property on new lines are treated as nested selectors.
```imba
css .card
    display: block
    background: gray1
    .title color:blue6 # matches .card .title
    h2.desc color:gray6 # matches .card h2.title
    # to scope in on current item use &
    &.large padding:16px # matches .card.large
```

### Nested Rules

### Rule Scopes

### Variables

### Modifiers [slug=modifiers]

### Keyframes

## Inline Styles [slug=inline]

You can add inline styles on any element using `[style-properties]` syntax. You can think of this as an inlined anonymous class with a bunch of css properties.
Instead of coming up with an arbitrary class name and adding styles somewhere else, you can simply add them to elements directly:
```imba
<div[position:relative display:flex flex-direction:row padding:2rem]>
```
This might look like regular inline styles, but with abbreviations and modifiers they become much more powerful and expressive:
```imba
# More padding on large screens:
<div[pos:relative d:flex fld:row p:2 @lg:3]>
# Darker background color on hover:
<button[bg:gray2 @hover:gray3]> "Click me"
# Set text color when input is focused:
<input[color@focus:blue7]>
```
Since inline styles are essentially anonymous classes, they can also be applied conditionally:
```imba
# line-through and lighter color if item is done
<div[p:2 color:green9] [td:s c:gray4]=item.done>
```


### Dynamic Values

It is also possible to interpolate dynamic values into styles. This happens efficiently at runtime using css variables behind the scenes. This allows you to even write dynamic styles in a declarative manner.

```imba
# ~preview=md
css div pos:absolute p:3 t:2 l:2
css section d:block pos:absolute inset:0 user-select:none

# ---
let ptr = {x:0, y:0}
let num = 0
imba.mount do
    <section @pointermove=(ptr = e) @click=(num++)>
        <div[bg:teal2 x:{ptr.x} y:{ptr.y} rotate:{ptr.x / 360}]> "Full"
        <div[bg:purple2 x:{ptr.x / 2} y:{ptr.y / 2} rotate:{num / 45}]> "Half"
        
```


## Selector Modifiers [slug=modifiers]

## Property Aliases [slug=aliases]

## Design System [slug=theme]

### Colors

### Sizing

### Font Families

### Font Sizes


### Box Shadows

### Easing Functions

## Custom Units [slug=units]

## Responsive Styling [slug=responsive]

## Advanced Layouts

## Style Precedence [slug=precedence]

# Modules

# Miscellaneous

## Decorators

## Custom Iterables  [slug=iterables]

## Type Annotations