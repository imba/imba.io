---
title: Basics
multipage: true
---

# Overview

## What is Imba

Imba is a new programming language for the web that compiles
to performant JavaScript. It is heavily inspired by ruby and python,
but developed explicitly for web programming (both server and client).
Imba treats dom elements *and* styles as first-class citizens. Elements are compiled to a [memoized dom](/guides/advanced/performance), which is an [order of magnitude faster](https://somebee.github.io/dom-reconciler-bench/index.html) than todays virtual dom implementations. We truly believe that it opens up for a new way of developing web applications.

## Basic Syntax

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

##### Classes
```imba
class Todo
    prop title
    prop completed = no
    
    def complete
        completed = yes


let todo = Todo.new 'Read introduction'
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
```imba
# elements are first class citizens
var list = <ul title="reminders">
    <li> "Remember milk"
    <li> "Greet visitor"

# setting classes on elements:
<div.panel.large> "Hello world"
# setting dynamic and conditional classes:
<div.panel.state-{state} .hidden=condition> "Panel"
# binding handlers (with modifiers):
<div.panel @click.prevent=handler> "Panel"
```

> Elements are a native part of Imba just like strings, numbers, and other types.

##### Components

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

> Tags are compiled down to *extremely optimized* native web components

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

# ---
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
> Decorators

##### Type annotations
```imba
let item\string = window.title

def multiply a\number, b\number
    a * b
```

> Type annotations in imba are compiled to jsdoc comments and are used for intelligent auto-completions and analysis in vscode and more.


## Installation

### Tooling

## Caveats

### Coming from JS

### Indentation

### Scoping

### Implicit Invocation

### Bang Invocation

### Implicit Self

### Self vs This

### Dashed Identifiers

### Everything is Expressable

Almost everything in imba are expressions. So, you can theoretically return and assign an if statement:
```imba
let x = 7
let result = if x > 10
    'large'
elif x > 5
    if x % 2 == 0
        'medium even'
    else
        'medium odd'
else
    'small'
console.log result # 'medium odd'
```
This isn't to be abused, but can in many cases be practical.

### Predicate identifiers

## Terminology

### Truthy

### Falsy

### Element

### Component

### Instance

### Initializer

### Property

### Weak scope

### Strong scope

### Tick

### Tag vs Element vs Component


# Literal Types

The fundamental types are the same as in JavaScript, so for documentation about available methods see MDN [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), [Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math).




##### String

```imba
let single = 'single quotes'
let double = "string has {double}"
let template = `current version is {imba.version}`
```

##### Number
```imba
let integer = 42
let float = 42.10
let hex = 0x00
let binary = 0b0010110
let separated = 120_000_000
```

##### Boolean

```imba
let bool1 = true
let bool2 = yes # alias for true
let bool3 = false
let bool4 = no # alias for false
```

##### Null

```imba
let value = null
```

##### Undefined

```imba
let value = undefined
```

##### RegExp
```imba
let regex = /ab+c/i # literal
let other = new RegExp('ab+c', 'i')
```

##### Object
```imba
let object = {a: 'foo', b: 42, c: {}}
```

##### Array
```imba
let array = [1, 'two', {value: 3}]
```

##### Element
```imba
let list = <ul.main title='example'>
	<li.one> <span> 'one'
	<li.two> <span> 'two'
	<li.three> <span> 'three'
```

##### Methods
```imba
def multiply a,b
	a * b
```

## String

```imba
let single = 'single quotes'
let double = "double quotes"
let interpolation = "string has {double}"
let template = `current version is {imba.version}`
```

In JavaScript `${}` is used for interpolation. Imba uses `{}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`. Other than that, the String type is identical to String in JavaScript. See documentatino at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).


### Multiline Strings

Regular string literals can be written over multiple lines, but line breaks are ignored.
```imba
let string = 'one
two three'
# => 'onetwo three'
```


If you need a string that spans several lines and includes line breaks, use a sequence of characters surrounded by `'''` or `"""`
```imba
let string = '''
This string is written
over multiple lines
'''
# => 'This string\nis written over\nmultiple lines'
```

Multiline strings preserves indentation, but only relative to the least indented line:

```imba
let string = '''
    First level is ignored
        This is indented
    Not indented
    '''
```


### Template literals
```imba
`string text`
# multiple lines
`string text line 1
 string text line 2`
# interpolated expression
`string text ${expression} string text`
# tagged template
method`string text ${expression} string text`
```

## Number

```imba
let integer = 42
let float = 42.10
let hex = 0x00
let binary = 0b0010110
```
The Number type is identical to Number in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

```imba
let budget = 120_000_000
let spent = 123_150_077.59
let hex = 0xA0_B0_C0
let binary = 0b0010_1100
```
> You can use `_` as a separator inside numbers for improved readability.

```imba
const biggestNum     = Number.MAX_VALUE
const smallestNum    = Number.MIN_VALUE
const infiniteNum    = Number.POSITIVE_INFINITY
const negInfiniteNum = Number.NEGATIVE_INFINITY
const notANum        = Number.NaN
```


## Boolean

```imba
let bool1 = true
let bool2 = yes # alias for true
let bool3 = false
let bool4 = no # alias for false
```

## Null

```imba
let value = null
```

The value `null` represents the intentional absence of any object value. It is one of JavaScript's primitive values and is treated as falsy for boolean operations.



## RegExp

The RegExp object is used for matching text with a pattern. Read more at [MDN RegExp Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp). For an introduction to regular expressions, read the [Regular Expressions chapter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) on MDN.

##### Literal
```imba
let regex = /ab+c/i
```

##### Constructor
```imba
let regex = new RegExp('ab+c', 'i')
```

##### Multiline
```imba
let regex = ///
    ab+ # allows comments and whitespace
    c
///
```

## Object

##### Syntax
```imba
let object = {a: 'foo', b: 42, c: {}}
console.log(object.a) # => 'foo'
```

##### Dynamic keys
```imba
let field = 'age'
let person = {name: 'Bob Smith', [field]: 32, gender: 'male'}
console.log(person.age) # => 'Bob Smith'
```

##### Indented
```imba
let person =
    name: 'Bob Smith'
    age: 32
    gender: 'male'
console.log(person.name) # => 'Bob Smith'
```


##### Dot notation `.`
```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person.name
person.age = 33
```

##### Bracket notation `[]`
```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person['name']
person['age'] = 33
```

##### Destructuring
```imba
let a = 'foo'
let b = 42
let c = {}
let object = {a,b,c}
console.log(object) # => {a: 'foo', b: 42 c: {}}
```

## Array

##### Array Literal
```imba
[1, 2, 3, 4]
```

##### Indented Array Literal
```imba
const array = [
    'one'
    'two'
    'three'
    'four'
]
```
> Commas are optional when array elements are separated by line breaks.

## Element

DOM nodes are first-class citizens in Imba, meaning that they can be instantiated using a literal syntax. They are *actual DOM elements*. We are not using a virtual DOM.

##### Create element
```imba
let el = <div.main title='example'> "Hello world"
document.body.appendChild el
```

# Operators

##### Arithmetic
```imba
1 + 2 # Addition
3 - 2 # Subtraction
6 / 3 # Division
2 * 2 # Multiplication
5 % 2 # Remainder / Modulo
2 ** 2 # Exponential
-i # Unary negation
+i # Unary plus
```

##### Logical
```imba
expr1 && expr2 # Logical AND operator
expr1 || expr2 # Logical OR operator
!expr # Logical NOT operator
```

##### Assignment
```imba
item = 100 
item ||= 100 # If falsy assignment
item &&= 100 # If truthy assignment
item ?= 100 # If null assignment
item += 100 # Addition assignment
item -= 100 # Decrement assignment
item *= 100 # Multiplication assignment
item /= 100 # Division assignment
item %= 100 # Remainder assignment
item **= 100 # Exponential assignment
i++ # Increment assignment
i-- # Decrement assignment
```

##### Comparison
```imba
x == y # Equality
x != y # Inequality
x === y # Strict equality
x is y # Also strict equality
x !== y # Strict inequality
x isnt y # Also strict inequality
x > y # Greater than
x >= y # Greater than or equal
x < y # Less than
x <= y # Less than or equal
10 > x > 5 # Chained comparison
```

##### Bitwise Comparison
```imba
a & b # Bitwise AND
a | b # Bitwise OR
a ^ b # Bitwise XOR
~ a # Bitwise NOT
a << b # Left shift
a >> b # Sign-propagating right shift
a >>> b # Zero-fill right shift
```

##### Bitwise Assignment
```imba
a <<= 1 # Left shift assignment
a >>= 1 # Right shift assignment
a >>>= 1 # Unsigned right shift assignment
a &= 1 # Bitwise AND assignment
a |= 1 # Bitwise OR assignment
a ^= 1 # Bitwise XOR assignment
```

##### isa
```imba
honda isa Car # 
princess !isa Car 
```
> The `isa` operator tests whether the prototype property of a constructor appears anywhere in the prototype chain of an object. Alias for the javascript [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) operator.

##### delete
```imba
delete object.property
```


# Control Flow

##### if
```imba
# indented
if condition
    console.log 'yes!'
```
> The if statement executes the indented code if a specified condition is truthy.

##### else
```imba
if condition
    console.log 'yes!'
else
    console.log 'no!'
```
> If the condition is falsy, code inside the connected else block will execute.

##### elif
```imba
if expr > 10
    console.log 'over 10'
elif expr > 5
    console.log 'over 5'
elif expr
    console.log 'not falsy'
```
> To conveniently chain multiple conditionals, use `elif`. No `elif` or `else` statements will be executed after the first truthy condition.



##### unless
```imba
unless condition
    console.log 'condition was not truthy'
```
> The unless statement executes the indented code if a specified condition is *not* truthy.


##### ternary
```imba
condition ? console.log('yes!') : console.log('no!')
```
> The [Ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) is a useful way to write compact if / else statements.


##### trailing if & unless
```imba
console.log 'yes' if condition
console.log 'no' unless condition
```
> If & unless can also be used at the end of a single line expression

##### Switch

```imba
switch value
when 10
    yes
when 5
    no
else
    throw 'nope'
```


# Loops

Loops in Imba behaves similar to array comprehensions in CoffeeScript and Python. They are expressions, and can be returned and assigned. When used as expressions they will always return an array.

##### for in
```imba
let ary = [1,2,3]
for num,index in ary
    console.log num * index
```
> Basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`

##### for of
```imba
let iter = new Set([1, 2, 3])
for value of iter
    value
```
> Iterating over iterable objects following the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) added in ES2015.

##### for own of
```imba
let obj = {a:1, b:2, c:3}
for own key,value of obj
    "{key} is {value}"
```
> Convenient syntax for looping through key-value pairs of objects.

##### while
```imba
let ary = [1,2,3]
while let item = ary.pop!
    console.log item
```
> Executes repeatedly as long as condition is truthy.

##### until
```imba
let ary = [1,2,3]
until ary.length == 0
    console.log ary.pop!
```
> Executes repeatedly until condition is truthy.

## Loops as expressions

One important difference from JavaScript is that loops can behave as expressions. This means that you can assign them to variables, return them from methods, and everything you could do with other expressions. When used as expressions these loops returns an array containing the result of every iteration of the loop.

```imba
let items = for num in [1,2,3]
    num * 2
console.log items # => [2,4,6]
```
Using this in combination with `break`, `continue` and conditionals makes for very concise ways to loop through, map, and filter iterables in one operation.
```imba
import {movies} from 'imdb'

let hits = for movie,index in movies
    continue unless movie.genres.includes('Drama')
    continue if movie.rating < 8.8
    [index + 1,movie.title]
console.log hits

# let dramas = (mov.title for mov in movies when mov.genres.includes('Drama'))
# console.log dramas
```

## For in

> Imba `for in` is not to be confused with `for in` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in).

For in is the basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`. This includes `Array`, `NodeList`, `DOMTokenList`, `String` and more. It was created before `for of` iterables became standard in ES2015, but is still a practical alternative to using `for of` in many cases.

##### for in
```imba
for num in [1,2,3]
    num
```

##### with optional index parameter
```imba
for num,index in [1,2,3]
    num * index
# [1,4,9]
```

##### specifying increment with `by`
```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

##### inclusive range `..`
```imba
# from 0 up to (including) 3
console.log for num in [0 .. 3]
    num
# [0,1,2,3]
```

##### exclusive range `...`
```imba
# from 0 up to (excluding) 3
for num in [0 ... 3]
    num
# [0,1,2]
```
> Ranges **must include spaces** around `..` and `...`

##### toIterable
```imba
class LabelString
    def constructor label
        label = label

    def toIterable
        console.log 'called toIterable'
        label.split(',')

let labels = new LabelString 'idea,proposal,duplicate'

for label in labels
    console.log label.toUpperCase!
```

> When Imba cannot infer that an object is an array during compilation it will behind the scenes look for a `toIterable` method on the object before looping. This way one can make any type of object easily support being iterated using a `for in` loop.

## For of

The for...of statement creates a loop iterating over iterable objects, including: built-in String, Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map, Set, and user-defined iterables. This maps directly to `for of` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) with a few convenient additions.


##### Iterating over an `Array`
```imba
let iterable = [10,20,30]
for value of iterable
    console.log value
```

##### Iterating over a `String`
```imba
let iterable = 'foo'
for value of iterable
    console.log value
```


##### Iterating over a `TypedArray`
```imba
let iterable = new Uint8Array([0x00,0xff])
for value of iterable
    console.log value
```
##### Iterating over a `Map`
```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry of iterable
    console.log entry

# destructuring
for [key,value] of iterable
    console.log value
```

##### Iterating over a `Set`
```imba
let iterable = new Set([1, 1, 2, 2, 3, 3])
for value of iterable
    console.log value
```

##### Iterating over the arguments object
```imba
def fn
    for arg of arguments
        arg * 2
console.log fn(1,2,3) # => [2,4,6]
```

##### Iterating with `index`
```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry,idx of iterable
    console.log entry,idx
for [key,value],idx of iterable
    console.log key,value,idx
```
> In imba you can supply a second parameter to `for ... of`. This will be populated with the current iteration number (starting at 0), just like the second argument in `Array#map` and `Array#forEach`.


## For own of

One pretty common need is to loop through the key-value pairs of plain objects. The commonly recommended way to do this in JavaScript is:
```javascript
let obj = {a: 1, b: 2, c: 3}
for (const key of Object.keys(obj)) {
    console.log(`${key} is ${obj[key]}`);
}
```
Since this is a relatively common pattern - Imba has specific support for this using `for own of`. This statement creates a loop iterating over key-value pairs of objects.

```imba
let obj = {a: 1, b: 2, c: 3}
for own key,value of obj
    console.log "{key} is {value}"
```

## Break, Continue & When

> `break`, `continue` & `when` is supported in all loop types (`for in`, `for of` and `for own of`)

##### break
```imba
var res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# [2,4]
```

##### continue
```imba
let res = for num in [1,2,3,4,5]
    continue if num == 3
    num * 2
console.log res # [2,4,8,10]
```

##### when
```imba
const res = for num of [1,2,3,4,5] when num != 3
    num * 2
console.log res # [2,4,8,10]
```
> `when` is essentially a shorthand for continuing past values that don't match a condition.

##### continue *value*
```imba
var res = for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
# continue with an argument acts like early return within Array#map
# res => [2,4,-1,8,10]
```
> When supplying an argument to continue, this value will be added to the resulting array, much like an early return would do in an `Array#map` function.

##### break *value*
```imba
# break with argument
var res = for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
res == [2,4,-1]
```
> When supplying an argument to break, this value will be added to the resulting array. Especially useful when you want to return until some condition is met, but also want to include the item at which condition was met.

# Functions

##### Defining functions
```imba
# defining a function
def square number
    number * number

# invoking a function
square(5)
# parenthesis are optional
square 5
```

##### Invoking with arguments
```imba
console.log(1,2,3)
# when invoking a function with arguments the parens are optional
console.log 1,2,3
```

##### Invoking with callback
```imba
[10,20,30,40].map do(num) num * 2
```

##### Invoking without arguments
```imba
document.location.reload!
```
> You are free to use empty parens `()` for invoking functions without arguments, but the preferred style in imba is to use the exclamation mark.

## Function Parameters

##### With default parameters
```imba
def multiply a, b = 1
    a * b
multiply(5)
```

##### Rest parameters
```imba
def multiply multiplier, ...numbers
    return (num * multiplier for num in numbers)
multiply(2,1,2,3) # [2,4,6]
```

##### Destructuring parameters
```imba
def draw {size = 'big', coords = {x:0, y:0}, radius = 25}
	console.log size,coords,radius

draw(coords: {x: 18, y:30},radius:30)
```

### Parameter references

Inside of a function `$0` always refers to the `arguments` object, and `$1`,`$2`,`$3`,`$n` refers to argument number 1,2,3 etc. This can come handy in many inline methods where you just want to access the first argument.
```imba
['a','b','c','d'].map do $1.toUpperCase!
# is essentially the same as writing
['a','b','c','d'].map do(item) item.toUpperCase!
```
> This might seem like a trivial difference, but in many cases you don't want the cognitive overload to come up with a sensible parameter name.

## Calling functions

> Optional parenthesis

### Without Arguments

Any method that can be


### Object Arguments

### Callback Arguments

A callback function is a function passed into another function as an argument. This is a common pattern in JavaScript. When passing a callback argument in Imba, you can write this after the function:

```imba
def update data, callback
    # post data to server ...
    callback! if callback

update(score: 1023) do
    console.log 'callback was called'
```

The general convention is to expect callbacks as the last argument. In the cases where this is not the case, you can represent the position of the callback argument using `&`. `setTimeout` is a built-in JavaScript function that expects the callback as the first argument. To call this in Imba you would write:

```imba
setTimeout(&,200) do console.log 'fired after 200ms'
```

A callback is just an anonymous function. When callbacks are called with arguments you simply declare parameters on the callback function:

```imba
def update data, callback
    # post data to server ...
    callback(null,response) if callback

update(score: 1023) do(err,resp)
    console.log 'response from update',resp
```



# Classes

##### Class declarations
```imba
class Retangle
    def constructor height, width
        self.height = height
        self.width = width

    def setup
        self
```

##### Class expressions
```imba
var expr = class
    def constructor height, width
        self.height = height
        self.width = width
```

## Inheritance

## super


# Modules

In this section we will be looking closer at how you can use existing code in your Imba projects. We will cover the `import` and `export` keywords. While it will beneficial for you to know about ESM and how it works in [Node.js](https://nodejs.org/api/esm.html#esm_ecmascript_modules) and the behavior of [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) and [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) in the browser. This page only focuses on the Imba specific bits you need to know and how to use them effectively.

This part of the documentation is intentionally terse, please see the guide for more in-depth descriptions.

## Importing Imba Code

The `import` keyword works mostly the same but there are a few different usages worth nothing. In contrary to ESM imports for Imba files, you don't have the file suffix `.imba` at the end. *Always import Imba code without the file suffix*.

### Importing Tags

When you are importing your own tags it suffices to specify the filename without the extension

```imba
import './my-component'
```

That will make the component available and you can start using your component.

## Individual Imports

In the examples below we are using a class inside of `MyClass.imba` but this works for variables, methods and static methods alike.

```imba
class MyClass
[...]
```

To be able to access my class outside you need to change it to be exported. 

```imba
export class MyClass
[...]
```

This will then allow you to import it 

```imba
import { MyClass } from './MyClass'
```

## Default Export

If you prefer importing without the curly braces, you need to make the export use the default property

```imba
export default class MyClass
[...]
```

Then you can

```imba
import MyClass from './MyClass'
```

## Using packages from NPM

Using packages you have installed is very straightforward. In the below example it's assumed `cowsay` has been installed

```html
yarn add cowsay # npm install cowsay
```

```imba
import cowsay from 'cowsay'

console.log(cowsay.say({text: 'imba is awesome'}))

### Output
< imba is awesome >
 -----------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
###
```

## Import Aliases

If you are not happy with the default exported name you can override it with your own using the 

```imba
import * as MyClassAlias from './MyClass'
```

That will put everything exported into MyClassAlias. 

Note that if you have a `default` export then you will need to access the default property `.default`. So creating a instance of `MyClassAlias` would look like

```imba
let instance = MyClassAlias.default.new()
```