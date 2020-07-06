---
title: Handbook
multipage: true
---

# Introduction


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

# - String

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

# - Number

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


# - Boolean

```imba
let bool1 = true
let bool2 = yes # alias for true
let bool3 = false
let bool4 = no # alias for false
```

# - Null

```imba
let value = null
```

The value `null` represents the intentional absence of any object value. It is one of JavaScript's primitive values and is treated as falsy for boolean operations.



# - RegExp

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

# - Object

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

# - Array

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

# - Element

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

##### Switch [snippet]

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

##### for in [snippet]
```imba
let ary = [1,2,3]
for num,index in ary
    console.log num * index
```
Basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`

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

### Loops as expressions [tip]

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

For in is the basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`. This includes `Array`, `NodeList`, `DOMTokenList`, `String` and more. It was created before `for of` iterables became standard in ES2015, but is still a practical alternative to using `for of` in many cases. Imba `for in` is not to be confused with `for in` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in).

##### for in [snippet]
```imba
for num in [1,2,3]
    num
```

##### with optional index parameter [snippet]
```imba
for num,index in [1,2,3]
    num * index
# [1,4,9]
```

##### specifying increment with `by` [snippet]
```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

##### inclusive range `..` [snippet]
```imba
# from 0 up to (including) 3
console.log for num in [0 .. 3]
    num
# [0,1,2,3]
```

##### exclusive range `...` [snippet]
```imba
# from 0 up to (excluding) 3
for num in [0 ... 3]
    num
# [0,1,2]
```
Ranges **must include spaces** around `..` and `...`

##### toIterable [snippet]
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


##### Iterating over an `Array` [snippet]
```imba
let iterable = [10,20,30]
for value of iterable
    console.log value
```

##### Iterating over a `String` [snippet]
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

`break`, `continue` & `when` is supported in all loop types (`for in`, `for of` and `for own of`)

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
`when` is essentially a shorthand for continuing past values that don't match a condition.

##### continue *value*
```imba
var res = for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
# continue with an argument acts like early return within Array#map
# res => [2,4,-1,8,10]
```
When supplying an argument to continue, this value will be added to the resulting array, much like an early return would do in an `Array#map` function.

##### break *value*
```imba
# break with argument
var res = for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
res == [2,4,-1]
```
When supplying an argument to break, this value will be added to the resulting array. Especially useful when you want to return until some condition is met, but also want to include the item at which condition was met.

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

### Parameters

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

##### Parameter references
```imba
['a','b','c','d'].map do $1.toUpperCase!
# is essentially the same as writing
['a','b','c','d'].map do(item) item.toUpperCase!
```
Inside of a function `$0` always refers to the `arguments` object, and `$1`,`$2`,`$3`,`$n` refers to argument number 1,2,3 etc. This can come handy in many inline methods where you just want to access the first argument. This might seem like a trivial difference, but in many cases you don't want the cognitive overload to come up with a sensible parameter name.

### Invocation

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
You are free to use empty parens `()` for invoking functions without arguments, but the preferred style in imba is to use the exclamation mark.



### Callbacks

A callback is a function passed into another function as an argument. This is a common pattern in JavaScript. When passing a callback argument in Imba, you can write this after the function:

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

# Decorators

# Async / Await

> No need to use the `async` keyword.

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

# Elements

Imba treats DOM elements first-class citizens, on a much deeper level than JSX. Imba does not use a virtual dom but compiles declarative tag trees into an incredibly efficient [memoized dom](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52), which is orders of magnitute faster than vdom approaches, yet conceptually simpler.

```imba
# Creating a literal dom element:
let div = <div#main.note.sticky title='Welcome'> 'Hello'
# is essentially equivalent to:
let div = document.createElement('div')
div.id = 'main'
div.classList.add('note')
div.classList.add('sticky')
div.title = 'Welcome'
div.textContent = 'Hello'
```


The first part of your tag literal should be the node name. So, to create a section you write `<section>`, for a list item you write `<li>` and so forth. 

```imba
# ~preview
import 'util/styles'
# ---
let data = {type: 'button', label: 'Hello'}
imba.mount do
    <div.group>
        <section> "A section"
        <{data.type}> data.label
```

It is even possible to spawn a tag with a dynamic type - by using `{}` interpolation in the tag name
```imba
# ~preview
import 'util/styles'
# ---
let data = {type: 'button', label: 'Hello'}
imba.mount do <{data.type} title="Item"> data.label
```

If you create an element without a node name it will always be created as a `div`.

# - Properties & Classes

### ID

To set the id of an element you can use the shorthand `<element#my-id>` syntax
```imba
<div#main> "Hello"
```

### Properties
```imba
<div lang="en" title=data.title> "Hello"
```

### Classes

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

### Inline Styles

```imba
<div[color:red bg:blue padding:8px]> "Hello"
```
Just like classes, styles can be conditionally applied
```imba
<div[color:red bg:blue] [display:none]=app.loggedIn> "Hello"
```

# - Nested Elements

Indentation is significant in Imba, and tags follow the same principles. We never explicitly close our tags. Instead, tags are closed implicitly by indentation. So, to add children to an element you simply indent them below:

```imba
<div> <ul>
	<li> <span> 'one'
	<li> <span> 'two'
	<li> <span> 'three'
```
Tags can also be included inside string interpolations, so that templates like this:
```imba
<div>
    "This is "
    <b> "very"
    " important"
```
Can be written like on a single line
```imba
<div> "This is {<b> "very"} important"
```
Also, if you explicitly close your elements using `/>` at the end, you can add multiple elements after one another without problem:
```imba
<label> <input type='checkbox'/> 'Dark Mode'
```

### Fragments

Fragments can be created using empty tag literals `<>`.

# - Conditionals & Loops

There isn't really a difference between templating syntax and other code in Imba. Tag trees are just code, so logic and control flow statements work as you would expect. To render dynamic lists of items you simply write a `for` loop where you want the children to be:
```imba
<div>
    if items
        <h1> "List of items:"
        <ul> for item in items
            <li> <span> item
    else
        <span> "No items found"
```

You can use break, continue and other control flow concepts as well:

```imba
# ~preview=xl
import {movies} from 'imdb'

css .heading c:blue7 fs:xs fw:bold p:2 bc:gray3 bbw:1 pos:sticky t:0 bg:white
css .item mx:2 d:flex px:2 py:3 bc:gray2 bbw:1 bg.hover:gray1
css .title px:1 t:truncate
css .number radius:3 px:2 bg:blue2 mr:1 fs:xs c:blue7 d:grid pc:center

# ---
imba.mount do <div.list> for movie,i in movies
    if i % 10 == 0
        # Add a heading for every 10th item
        <div.heading> "{i + 1} to {i + 10}"
    <div.item>
        <span.number> i + 1
        <span.title> movie.title
    # break out of the loop early
    break if movie.title == 'The Usual Suspects'
```

# - Handling Events

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

It is important to understand how these event handlers are treated. Imba is created to maximize readability and remove clutter. If you set the value to something that looks like a regular method call, this call (and its arguments) will only be called when the event is actually triggered.

```imba
<div @click=console.log('hey')> 'Will log hey'
```

In the example above, the console.log will only be called when clicking the element. If you just supply a reference to some function, imba will call that handler, with the event as the only argument.

```imba
<div @click=console.log> 'Will log the event'
```

Inside of these lazy handlers you can also refer to the event itself as `e`.

```imba
let x = 0
<button @click=console.log(e.type,e.x,e.y)> "Click"
<button @mousemove=(x = e.x)> "Mouse at {x}"
```
To learn more about event handling jump to the [Events section](/docs/events/basics).


# - Declarative Rendering

The fact that tag literals generate real dom nodes means that we can add/remove/modify the dom in an imperative way. In theory.

```imba
# ~preview=xl
import 'util/styles'

# ---
let array = ["First","Second"]

let view = <main>
    <button @click=array.push('More')> 'Add'
    <ul.list> for item in array
        <li> item

# view is a real native DOM element
document.body.appendChild view
```
Even tough we rendered a dynamic list of items, it won't update if new items are added to the array or if members of the array change. Clicking the button will actually add items, but our view is clearly not keeping up. What to do?

## Mounting

To make the tag tree update when our data changes, we need to add pass the tree to `imba.mount`.

```imba
# ~preview=xl
import 'util/styles'

# ---
let array = ["First","Second"]

imba.mount do 
    <main>
        <button @click=array.push('More')> 'Add'
        <ul.list> for item in array
            <li> item
```
Now you will see that when you click the button, our view instantly updates to reflect the new state. How does this happen without a virtual dom? The array is not being tracked in a special way (it is just a plain array), and we are only dealing with real dom elements, which are only changed and updated when there is real need for it. Imba uses a technique we call `memoized dom`, and you can read more about how it works [here](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52). Here is a more advanced example with more dynamic data and even dynamic inline styles:

```imba
# ~preview=xl
import 'util/styles'

css div pos:absolute d:block inset:0 p:4
css mark pos:absolute
css li d:inline-block px:1 m:1 radius:2 fs:xs bg:gray1 @hover:blue2

# ---
let x = 20, y = 20, title = "Hey"

imba.mount do
    <main @mousemove=(x=e.x,y=e.y)>
        <input bind=title>
        <label> "Mouse is at {x} {y}"
        <mark[x:{x} y:{y} rotate:{x / 360}]> "Item"
        <ul> for nr in [0 ... y]
            <li> nr % 12 and nr or title
```

By default Imba will **render your whole application whenever anything *may* have changed**. Imba isn't tracking anything. This sounds insane right? Isn't there a reason for all the incredibly complex state management libraries and patterns that track updates and wraps your data in proxies and all that? As long as you have mounted your root element using `imba.mount` you usually don't need to think more about it.

## Updating

 The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using await or returning a promise), Imba will also re-render after the promise is finished. Practically all state changes in applications happen as a result of some user interaction.

In the few occasions where you need to manually make sure views are updated, you should call `imba.commit`. It schedules an update for the next animation frame, and things will only be rerendered once even if you call `imba.commit` a thousand times. It returns a promise that resolves after the actual updates are completed, which is practical when you need to ensure that the view is in sync before doing something.

##### commit from websocket
```imba
socket.addEventListener('message',imba.commit)
```
Calling `imba.commit` after every message from socket will ensure that your views are up-to-date when your state changes as a result of some socket message.

##### commit after fetching data
```imba
def load
    let res = await window.fetch("/items")
    state.items = await res.json!
    imba.commit!
```

# - Form Input Bindings

## Basic Usage

##### text
```imba
# ~preview
import 'util/styles'

# ---
let message = "Hello"

imba.mount do <section>
	<input type='text' bind=message>
	<label> "Message is {message}"
```

##### textarea
```imba
# ~preview
import 'util/styles'

# ---
let tweet = ''

imba.mount do <section>
	<textarea bind=tweet placeholder="What's on your mind...">
	<label> "Written {tweet.length} characters"
```

##### range
```imba
# ~preview
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
# ~preview
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
# ~preview
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
# ~preview
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

## Custom Bindings

##### custom elements
```imba
# ~preview
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
# ~preview
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

# - Managing State

# Components

# - Introduction

## Web Components

Components are reusable elements with functionality and children attached to them. Components are *just like regular classes* and uses all the same syntax to declare properties, methods, getters and setters. To create a Component, use the keyword `tag` followed by a component name according to web-component's custom component naming convention. It must contain at least two words separated by a dash. 

```imba
tag app-component
    # add methods, properties, ...
```

These components are compiled to [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and are *global* in your project. As long as you have imported the component *somewhere in your code*, you can create instances of the component anywhere.

## Local Components

Custom Elements that start with an uppercase letter is treated as a local component.

Sometimes you want to define custom components that are local to a subsystem of your application. Other parts don't need to know about it, and you definitely don't want it to cause collisions with other parts.
```imba
tag Header
    <self> "App header"

tag App
    <self>
        <Header>
        <main> "Application"
```

As opposed to web components, local components must be exported and imported in the files where they are actually used.

### Functional Components

Any method can essentially act like a component in Imba.

```imba
def app-list items
    <ul> for item in items
        <li> item

const array = [1,2,3]
imba.mount do <div> app-list(array)
```

## Properties

## Attributes


# - Using Slots

Sometimes you want to allow taking in elements from the outside and render them somewhere inside the tree of your component. `<slot>` is a placeholder for the content being passed in from the outside.

##### Basic slot
```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> ~[<slot>]~

<app-option>
    ~[<b> "Option name"
    <span> "Description for this option"]~
```

Anything inside the `<slot>` will be shown if no content is supplied from outside.

```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> ~[<slot> "Unnamed option"]~
<app-option>
```
You can also add named slots using `<slot name=...>` and render into them using `<el for=slotname>` in the outer rendering.
```imba
# ~preview
import 'util/styles'
css body d:flex

css app-panel
	header p:1 bg:gray3
	main p:3 fs:md
	footer p:1 bg:gray1

# ---
tag app-panel
    <self.panel>
        <header> ~[<slot name="header"> "Default Header"]~
        <main> ~[<slot> <p> "Default Body"]~
        <footer> ~[<slot name="footer"> "Default Footer"]~

imba.mount do <app-panel>
    ~[<div slot="header"> "Custom Header"
    <div> "Something in main slot"
    <div> "More in main slot"]~
```

# - Named Elements

It can be useful to keep references to certain child elements inside a component. This can be done using `<node$reference>` syntax.

```imba
# ~preview
import 'util/styles'

# ---
tag app-panel
    <self.group>
        <button @click=($name.value += 'Hi')> "Write"
        <input$name type='text'>
# ---

imba.mount <app-panel>
```
In the code above, `$name` is available everywhere inside `app-panel` component, but also from outside the app-panel as a property of the component.

# - Context

# - Lifecycle


## Hooks

These methods are meant to be defined in your components. In most cases you will only define a `render` method, and possibly `awaken` if you want to do some additional initialization when the element is first attached to the document.

| table  |  | |
| --- | --- | --- |
| `build` | Called before any properties etc are set | |
| `hydrate` | Called before awaken if element is not hydrated | |
| `dehydrate` | Called before serializing when rendering on server | |
| `awaken` | Called the first time the component is mounted | |
| `mount` | Called when the component is attached to the document | |
| `unmount` | Called when the component is detached from the document | |
| `render` | Called by both visit and tick | |
| `rendered` | Called after every `render` | |
| `tick` | Called on every imba.commit when component is scheduled |
| `visit` | Called when parent element is rendered |
| `commit` | Called by both visit and tick |

## States

Components also has a bunch of methods that you can call to inspect where in the lifecycle a component is:

| table  |  |
| --- | --- |
| `hydrated?` | Is this element created on the client (by imba) or has it been rehydrated? |
| `awakened?` | Called the first time the tag is mounted |
| `mounting?` | Is component in the process of being mounted? |
| `mounted?` | Is component attached to the document? |
| `render?` | Should component render? |
| `rendered?` | Has component been rendered? |
| `scheduled?` | Is component scheduled? |

## Hydration

Explain concepts of hydration

## Scheduling

##### Setup timer
```imba
tag app-clock
    def mount
        # call render every second
        $timer = setInterval(render.bind(self),1000)
    
    def unmount
        # remember to clear interval when tag unmounts
        clearInterval($timer)

    # if you _only_ want the clock to render via timer
    # and not when the parent element renders - we also
    # need to override visit
    def visit
        return
```
- Setting up a timer in mount and clearing it in unmount

##### Override visit
```imba
tag app-clock
    def visit
        commit! unless scheduled?
```




# Events

Stuff about event handling.

# - Listening to Events

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

It is important to understand how these event handlers are treated. Imba is created to maximize readability and remove clutter. If you set the value to something that looks like a regular method call, this call (and its arguments) will only be called when the event is actually triggered.

```imba
<div @click=console.log('hey')> 'Will log hey'
```

In the example above, the console.log will only be called when clicking the element. If you just supply a reference to some function, imba will call that handler, with the event as the only argument.

```imba
<div @click=console.log> 'Will log the event'
```

Inside of these lazy handlers you can also refer to the event itself as `e`.

```imba
let x = 0
<button @click=console.log(e.type,e.x,e.y)> "Click"
<button @mousemove=(x = e.x)> "Mouse at {x}"
```

Remember that the expression will be called as is, so you never need to bind functions to their context and/or arguments.

```imba
import {todos} from './data.imba'

const handler = console.log.bind(console)

# ---
<ul> for item,i in todos
	<li @click=handler(e.type,item,i)> item.title
```

# - Chaining Handlers

# - Triggering Events

# - Event Modifiers


Inspired by vue.js, Imba supports event modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers can be pure logic without any knowledge of the event that triggered them.

## Core Modifiers

##### prevent [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# calls preventDefault on event
imba.mount do
	<a href='https://google.com' @click.prevent.log('prevented')> 'Link'
```

##### stop [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# .stop will call stopPropagation() on the event
imba.mount do <div.group @click.log('clicked div')>
	<button @click.stop.log('stopped')> 'stop'
	<button @click.log('bubble')> 'bubble'
```

##### once [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'
# ---
# the click event will be triggered at most once
imba.mount do <button @click.once.log('once!')> 'Click me'
```

##### capture [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
imba.mount do
	<div @click.capture.stop.log('captured!')>
		<button @click.log('button')> 'Click me'
```

##### passive [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
imba.mount do
	<main[overflow:scroll] @scroll.passive.log('scrolled')>
		<article> "One"
		<article> "Two"
		<article> "Three"
```

## Utility Modifiers

##### log ( ...params ) [event-modifier] [snippet]

```imba
# ~preview=small
import 'util/styles'

# ---
# log to the console
imba.mount do
	<button @click.log('logged!')> 'test'
```

##### wait ( duration = 250ms ) [event-modifier] [snippet]

```imba
# ~preview=small
import 'util/styles'

# ---
# delay subsequent modifiers by duration
imba.mount do <div.group>
	<button @click.wait.log('logged!')> 'default'
	<button @click.wait(100).log('logged!')> 'fast'
	<button @click.log('!').wait(500).log('!!')> 'chained'
```

##### throttle ( ms ) [event-modifier] [snippet]

```imba
# ~preview=small
import 'util/styles'

# ---
# disable handler for duration after triggered 
imba.mount do
	<button @click.throttle(1000).log('clicked')> 'click me'
```

##### emit-*name* ( detail = {} ) [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
# Shorthand for emitting events
imba.mount do
	<div.group @select=console.log(e.type,e.detail)>
		<button @click.emit-select> 'emit'
		<button @click.emit-select(a:1,b:2)> 'with data'
```

##### flag-*name* ( target ) [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
# Add flag while event is being handled
imba.mount do
	<div.group>
		<button @click.flag-busy> 'flag self'
		<button @click.flag-busy('div').wait(1000)> 'flag div'
# Optionally supply a selector / element to flag
```


##### silence [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
let counter = 0
imba.mount do <section>
	<div.group>
		<button @click.silence.log('silenced')> "Silenced"
		<button @click.log('clicked')> "Not silenced"
	<label> "Rendered {++counter} times"
# By default, Imba will commit after all handled events.
# In the few cases you want to suppress this, add the `silence` modifier.
```


## Guard Modifiers

##### self [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'
# ---
# only trigger handler if event.target is the element itself
imba.mount do 
	<button @click.self.log('clicked self')>
		"Button"
		<b> "Nested"
```

##### sel ( selector ) [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# only trigger if event.target.closest(selector) is true
imba.mount do <div.group>
	<button @click.log('!')> 'Button'
	<button @click.sel('.pri').log('!!')> 'Button'
	<button.pri @click.sel('.pri').log('!!!')> 'Button'
```

##### if ( expr ) [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'
# ---
let age = 20
# break chain unless expr is truthy
imba.mount do <div.group>
	<input type='number' bind=age>
	<button @click.if(age > 20).log('drink')> 'drink'
	<button @click.if(age > 16).log('drive')> 'drive'
```

##### keys [snippet]
```imba
# ~preview
import 'util/styles'

# ---
imba.mount do 
	<header> <input placeholder='Text..'
		@keydown.enter.log('pressed enter')
		@keydown.left.log('pressed left')
		@keydown.right.log('pressed right')
		@keydown.up.log('pressed up')
		@keydown.down.log('pressed down')
		@keydown.tab.log('pressed tab')
		@keydown.esc.log('pressed esc')
		@keydown.space.log('pressed space')
		@keydown.del.log('pressed del')
	>
```

## System Key Modifiers

System modifier keys are different from regular keys and when used with @keyup events, they have to be pressed when the event is emitted. In other words, @keyup.ctrl will only trigger if you release a key while holding down ctrl. It won’t trigger if you release the ctrl key alone. You can use the following modifiers to trigger event listeners only when the corresponding modifier key is pressed:

##### ctrl [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless ctrl key is pressed
imba.mount do <div.group>
	<button @click.ctrl.log('ctrl+click')> 'ctrl+click'
	# On mac there is no way to detect a `control+click` event.
	# Instead you will have to intercept the `contextmenu` event,
	# which is triggered by `control+click` and right mouse.
	<button @contextmenu.prevent.ctrl.log('ctrlish+click')> 'ctrlish+click'
```

##### alt [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless alt key is pressed
imba.mount do
	<button @click.alt.log('alt+click')> 'alt+click'
```

##### shift [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless shift key is pressed
imba.mount do
	<button @click.shift.log('shift+click')> 'shift+click'
```

##### meta [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless meta key is pressed
# On mac keyboards, meta is the command key (⌘).
# On windows keyboards, meta is the Windows key (⊞)
imba.mount do <button @click.meta.log('meta+click')> 'meta+click'
```

## Pointer Modifiers

Modifiers available for all pointer events – pointerover, pointerenter, pointerdown, pointermove, pointerup, pointercancel, pointerout & pointerleave.

##### mouse [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.mouse.log('only mouse!')> 'Button'
```

##### pen [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pen.log('only pen!')> 'Button'
```

##### touch [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.touch.log('only touch!')> 'Button'
```

##### pressure ( threshold = 0.5 ) [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pressure.log('pressured?')> 'Button'
```

## Touch Modifiers

The following modifiers are available for the special `touch` event. More in depth examples of these modifiers can be seen in the [Touch](/docs/events/touch) docs.

##### moved ( threshold = 4px ) [event-modifier] [touch-modifier] [snippet]

```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	# won't trigger until moved 30px from start
	<self @touch.moved(30)=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

Will break the chain until the touch has moved more than `threshold`. The element will also activate the `@move` pseudostate during touch - after threshold is reached.



##### moved-*direction* ( threshold = 4px ) [event-modifier] [touch-modifier] [snippet]
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-up=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
Direction can be `up`, `down`, `left`, `right`, `x`, and `y`

##### sync ( data, xname = 'x', yname = 'y' ) [event-modifier] [touch-modifier] [snippet]

```imba
# ~preview=lg
import 'util/styles'

# ---
tag Draggable
	prop pos = {x:0,y:0}
	<self[w:80px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)>
# ---
imba.mount do <Draggable>
```

A convenient touch modifier that takes care of updating the x,y values of some data during touch. When touch starts sync will remember the initial x,y values and only add/subtract based on movement of the touch.

## Resize Modifiers

## Intersection Modifiers

##### in [event-modifier] [intersection-modifier] [snippet]
```imba
<div @intersect.in=handler>
```
Break unless intersection ratio has increased.

##### out [event-modifier] [intersection-modifier] [snippet]
```imba
<div @intersect.out=handler>
```
Break unless intersection ratio has decreased.



# - Handling Touches


To make it easier and more fun to work with touches, Imba includes a custom `touch` event that combines `pointerdown` -> `pointermove` -> `pointerup/pointercancel` in one convenient handler, with modifiers for commonly needed functionality.

```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch=(x=e.x,y=e.y)> "x={x} y={y}"
# ---
imba.mount do <Example.rect>
```

The `event` emitted by this handler is not an event, but a `Touch` object, that remains the same across the whole touch. 

| Properties  |  |
| --- | --- |
| `e.event` | The last/current event in this touch |
| `e.target` | The element that initiated this touch |
| `e.events` | Array of all the events that are part of this touch |
| `e.x` | Normalized x coordinate for the pointer |
| `e.y` | Normalized y coordinate for the pointer |
| `e.elapsed` | The time elapsed since pointerdown started (in milliseconds) |


You can add arbitrary properties to the touch object if you need to keep track of things across the many events that will be triggered during this touch.

## Thresholds

##### moved ( threshold = 4px )

```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	# won't trigger until moved 30px from start
	<self @touch.moved(30)=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

This guard will break the chain unless the touch has moved more than `threshold`. Once this threshold has been reached, all subsequent updates of touch will pass through. The element will also activate the `@move` pseudostate during touch - after threshold is reached.



##### moved-up ( threshold = 4px )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-up=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
##### moved-down ( threshold = 4px )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-down=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

##### moved-left ( threshold = 4px )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-left=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
##### moved-right ( threshold = 4px )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-right=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

##### moved-x ( threshold = 4px )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-x=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
##### moved-y ( threshold = 4px )
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-y=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

## Syncing

A convenient touch modifier that takes care of updating the x,y values of some data during touch. When touch starts sync will remember the initial x,y values and only add/subtract based on movement of the touch.

##### sync ( data )


```imba
# ~preview=lg
import 'util/styles'

# ---
tag Draggable
	prop pos = {x:0,y:0}
	<self[w:80px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)>
# ---
imba.mount do <Draggable>
```

```imba
# ~preview=lg
import 'util/styles'

# ---
const pos = {x:0,y:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<[w:60px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)> 'drag'
	<[w:60px x:{pos.y} y:{pos.x}].rect> 'flipped'
```
Sync will update the x and y properties of whatever object you decide to supply as an argument.

##### sync ( data, alias-x, alias-y )
```imba
# ~preview=lg
import 'util/styles'

# ---
const data = {a:0,b:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<[w:80px x:{data.a} top:{data.b}px].rect @touch.sync(data,'a','b')> 'drag'
	<label> "a:{data.a} b:{data.b}"
```
You can also include the property names you want to sync x and y to/from.


## Interpolating

A very common need for touches is to convert the coordinates of the touch to some other frame of reference. When dragging you might want to make x,y relative to the container. For a custom slider you might want to convert the coordinates from pixels to relative offset of the slider track. There are loads of other scenarios where you'd want to convert the coordinates to some arbitrary scale and offset. This can easily be achieved with fitting modifiers.

##### fit ( box, snap = 1 )

```imba
# ~preview=lg
import 'util/styles'
css .rect w:80vw
# ---
tag Fitted
	<self @touch.fit(self)=(y=e.y)> "box.y {y}"
tag Unfitted
	<self @touch=(y=e.y)> "window.y {y}"
tag Snapped
	<self @touch.fit(self,2)=(y=e.y)> "box.y {y}"
# ---
imba.mount do <>
	<Fitted.rect>
	<Unfitted.rect>
	<Snapped.rect>
```
The first argument of fit is the box you want to fit to. If box is a string it will be treated as a selector and try to look up an element matching the selector

##### fit ( box, start, end, snap = 1)

```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from 0 in top left corner to 100 in bottom right
	<self @touch.fit(self,0,100)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```
By passing `start` and `end` values, you can very easily convert the coordinate space of the touch. Imba will use linear interpolation to convert x,y relative to the box, to the interpolated values between start and end.
You can use negative values on `start` and `end` as well.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from -50 to +50 with 0.1 increments
	<self @touch.fit(self,-50,50,0.1)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```


You can also use percentages in start and end to reference the width and height of the box we're mapping to.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# this will essentially flip the origin from top left to bottom right
	<self @touch.fit(self,100%,0)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```
You can also use arrays to fit the x and y axis to different values.
```imba
# ~preview=lg
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# will flip and center the y axis
	<self @touch.fit(self,[0,50%],[100%,-50%])=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```

## Pinning

## Examples

##### Custom slider
```imba
# ~preview=small
import 'util/styles'

css body > * w:50vw m:2 h:4 bg:blue3 pos:relative radius:sm
# css .track h:4 w:100% bg:blue3 pos:relative radius:sm
css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% radius:sm
css .thumb b x:-50% l:50% b:100% w:5 ta:center pos:absolute d:block fs:xs c:gray6

# ---
tag Slider
	prop min = -50
	prop max = 50
	prop step = 1
	prop value = 0

	<self @touch.fit(min,max,step)=(value = e.x)>
		<.thumb[l:{100 * (value - min) / (max - min)}%]> <b> value

imba.mount do <>
	<Slider min=0 max=1 step=0.25>
	<Slider min=-100 max=100 step=1>
	<Slider min=10 max=-10 step=0.5>
```

##### Pane with divider
```imba
# ~preview=small
import 'util/styles'

# ---
tag Panel
	prop split = 70

	<self[d:flex pos:absolute inset:0]>
		<div[bg:teal2 flex-basis:{split}%]>
		<div[fls:0 w:2 bg:teal3 @touch:teal5]
			@touch.pin.fit(self,0,100,2)=(split=e.x)>
		<div[bg:teal1 flex:1]>

imba.mount do <Panel>
```

##### Simple draggable [app]
```imba
# ~preview=xl
import 'util/styles'
# css body bg:gray1
# ---
tag drag-me
	css d:block pos:relative p:3 m:1 radius:sm cursor:default
		bg:white shadow:sm
		@touch scale:1.02
		@move scale:1.05 rotate:2deg zi:2 shadow:lg

	def build
		x = y = 0

	def render
		<self[x:{x} y:{y}] @touch.moved.sync(self)> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>
```

##### Paint [app]

```imba
# ~preview=xl
# ---
const dpr = window.devicePixelRatio

tag app-paint
	prop size = 500
	
	def draw e
		let path = e.$path ||= new Path2D
		path.lineTo(e.x * dpr,e.y * dpr)
		$canvas.getContext('2d').stroke(path)

	def render
		<self[d:block overflow:hidden bg:blue1]>
			<canvas$canvas[size:{size}px]
				width=size*dpr height=size*dpr @touch.fit(self)=draw>

imba.mount <app-paint>
```

# - Custom Events

# -- Intersection

[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a [well-supported](https://caniuse.com/#feat=intersectionobserver) API in modern browsers. It provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. In Imba it is extremely easy to set up an intersection observer.

| Properties  |  |
| --- | --- |
| `event.entry` | Returns the [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `event.ratio` | Returns the ratio of the intersectionRect to the boundingClientRect |
| `event.delta` | Difference in ratio since previous event |


##### Example

```imba
# ~preview=xl
css body p:6
css .grid d:grid g:3
css .box d:grid gap:4 p:4 radius:2 bw:1 bc:black/5
css .field p:1 px:2 radius:2 bw:1 bc:gray4 c:gray8
css .box bg:white .teal:teal3 .blue:blue3

# ---
import {genres} from 'imdb'

tag Genre
    css @force p:4 bg:blue2 h:120px

	prop ratio = 0

    def intersected e
        ratio = e.ratio

	def render
		<self[opacity:{ratio}] @intersect(10)=intersected> <slot>

imba.mount do
	<div.box> for genre in genres
		<Genre> genre
```

##### intersect(n)
```imba
# n 0-1 adds single threshold at n visibility
<div @intersect(0)=handler> # On 0%
<div @intersect(0.5)=handler> # On 50%
<div @intersect(1)=handler> # On 100%

# n > 1 will add n thresholds - spread evenly
<div @intersect(2)=handler> # Trigger [0%,100%]
<div @intersect(3)=handler> # Trigger [0%,50%,100%]
<div @intersect(5)=handler> # Trigger [0%,25%,50%,75%,100%]
# ... and so forth
```

##### intersect.in
```imba
# Will only trigger when intersection ratio increases
<div @intersect.in=handler>
# Will only trigger when element is more than 50% visible
<div @intersect(0.5).in=handler>
```
> The `in` modifier tells the intersection event to only trigger whenever the visibility has *increased*.

##### intersect.out
```imba
# Will only trigger when element starts intersecting
<div @intersect.out=handler>
# Will trigger whenever any part of the div is hidden
<div @intersect(1).out=handler>
```
> The `in` modifier tells the intersection event to only trigger whenever the visibility has *decreased*.


# -- Resize

# -- Selection



# Styling

First things first; You are free to use external stylesheets like you've always done. Still, with a goal of being the friendliest language for creating web applications we have included styling as a core part of the language. We've also extended the functionality of css to make common patterns friendlier, and to make it easier to keep a consistent design language across your whole project.


Our approach to styling is inspired by [Tailwind](https://tailwindcss.com), so we recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

# - Global Styles

Style rules are declared using the `css` keyword.

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
Besides using indentation instead of `{}`, making `;` optional, and using `@pseudo` instead of `:pseudo` it looks like regular css. Line breaks are also optional. The following few snippets might look messy at first glance, but bear with us.

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
This conciseness comes especially handy when declaring inline styles, which we will come back to later. Styles can also be nested. Everything before the first property on new lines are treated as nested selectors.
```imba
css .card
    display: block
    background: gray1
    .title color:blue6 # matches .card .title
    h2.desc color:gray6 # matches .card h2.title
    # to scope in on current item use &
    &.large padding:16px # matches .card.large
```

# - Scoped Styles

A problem with CSS is that often end up with tons of globally competing styles spread around numerous files. Changing some styles in one place might affect some seemingly unrelated elements. In Imba it is really easy to declare styles that should only apply to certain parts of your document. If you declare style rules inside tag definitions, all the styles will magically only apply to elements inside of this tag:
```imba
# these are global -- applies to everything in project
css body p:5
css h1 color:red5
css p color:black

# ---
tag app-card
    # local styles declared inside tag body
    css d:block p:3 bw:1 bc:gray2 radius:2
        h1 font:serif color:gray8 fs:20px
        p color:gray5 fs:15px
        $more color:gray4

    <self>
        <h1> "Gray Card Header"
        <p> "Gray Card Desc"
        <a$more> 'show more...'

imba.mount do <div>
    <app-card>
    <h1> "Red Header"
    <p> "Black paragraph"
```

### Only direct descendants

```imba
# ~preview

# ---
tag app-button
    css color:blue7
    <self> <span.title> <slot> 'button'

tag app-card
    # local styles declared inside tag body
    # affects only h1 title, not title inside app-button
    css .title color:teal7

    <self>
        <h1.title> "Gray Card Header"
        <p.desc> "Gray Card Desc"
        <app-button> 'show more...'

imba.mount do <app-card>
```

### Not styling elements added via slots

## Deep scoping

# - Inline Styles

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


## Interpolation

It is also possible to interpolate dynamic values into styles. This happens efficiently at runtime using css variables behind the scenes. This allows you to even write dynamic styles in a declarative manner.

```imba
# ~preview
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

### Specifying units

When you want to interpolate values with units you can include units after `{expr}` like `{expr}px`,`{expr}%` etc.
```imba
# ~preview
css div p:2 m:2 overflow:hidden min-width:80px

# ---
let ptr = {x:0, y:0}
imba.mount do
    <section[d:block pos:absolute inset:0] @pointermove=(ptr = e)>
        <div[bg:indigo2 w:{ptr.x / 10}%]> "% width"
        <div[bg:green2 w:{ptr.x}px]> "px width"
        
```

### Set properties directly
You can definitely use interpolated values with css variables as well, but it is best to interpolate them directly at the value where you want to use it. This way Imba can include the correct default unit if none is provided and more.

# - Mixins

[Code](/examples/more/mixins)

##### basics
```imba
css %btn
    py:2 px:3 radius:2
    bg:blue2 .warn:yellow2 .danger:red2
    color:blue7 .warn:yellow7 .danger:red7

imba.mount do <div>
    <div%btn> "Button"
    <div%btn.danger> "Danger"
    <div%btn.warn> "Warn"
```

# - Aliases

We firmly believe that less code is better code, so we have strived to make the styling syntax as concise yet readable as possible. There is a case to be made against short variable names in programming, but css properties are never-changing. Imba provides intuitive abbreviations for oft-used css properties. Like everything else, using these shorthands is completely optional, but especially for inline styles, they are convenient.

### size & position

<doc-style-aliases data-include='w,h,t,l,b,r,size'></doc-style-aliases>

### margin

<doc-style-aliases data-regex='margin|^m[tblrxy]$'></doc-style-aliases>

### padding

<doc-style-aliases data-regex='padding|^p[tblrxy]$'></doc-style-aliases>

### typography
<doc-style-aliases data-regex='text|font' data-neg='decoration|emphasis'  data-include='c,lh,ta,va,ls,fs,ff,fw,ws' data-exclude='t'></doc-style-aliases>

### text-decoration
<doc-style-aliases data-regex='text-decoration'></doc-style-aliases>

### text-emphasis
<doc-style-aliases data-regex='text-emphasis'></doc-style-aliases>

### layout

<doc-style-aliases data-include='d'></doc-style-aliases>

### flexbox

<doc-style-aliases data-regex='flex'></doc-style-aliases>

### grid

<doc-style-aliases data-regex='grid' data-include='g,rg,cg'></doc-style-aliases>

### alignment

<doc-style-aliases cols='3-transposed' data-regex='^place|^align|^justify|^[paj][ics]' data-exclude='a'></doc-style-aliases>

### background

<doc-style-aliases data-regex='background'></doc-style-aliases>

### border

<doc-style-aliases cols='3' data-regex='border' data-neg='radius'></doc-style-aliases>

### transform

<doc-style-transform-aliases></doc-style-transform-aliases>

### other

<doc-style-aliases data-regex='---' data-include='shadow,opacity,pe,zi,prefix,suffix,us'></doc-style-transform-aliases>

# - Modifiers

Modifiers are css [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) with superpowers. They can be used in selectors wherever you would normally use a pseudo-class. All css pseudo-classes are available as modifiers, but Imba offers additional modifiers to make responsive styling easy, as well as a ton of other convenient modifiers you can read about further down.

##### in selectors
```imba
css button@hover
    bg:blue
```

##### in properties
```imba
css button
    bg@hover:blue
```

##### after properties
```imba
css button
    bg:white @hover:whitesmoke @focus:blue
```

##### class modifiers
```imba
css button
    bg:white .primary:blue ..busy:gray
```

## Reference

<doc-style-modifiers></doc-style-modifiers>

# - Theming

Imba has a goal of making it as easy as possible to be consistent with regards to fonts, colors, sizes and more throughout your application. In the spirit of Tailwind, we supply a default "theme" with a whole range of delightfully hand-picked colors, font sizes, shadows and sizing/spacing units.

We are not talking about a "theme" like bootstrap – forcing you into creating generic bootstrap-looking designs – but more just a minimal set of defaults that can be used to create all sorts of varied but consistent designs. You can choose not to use them at all, or override everything in your custom theme config, but we think you will find it immensely useful.


## Dimensions

Imba allows unitless numeric values for all sizing related properties. For margin, padding, sizes, and positions unitless numbers are equal to `0.25rem * number`. `1rem` is `16px` by default, so this means that the scale increments by `4px` for every integer.

## Colors

The predefined colors are 9 shades of `gray`,`red`,`orange`,`yellow`,`green`,`teal`,`blue`,`indigo`,`purple` and `pink`, hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). You can hover over the colors below to see their name.

<doc-colors></doc-colors>

## Font Family

<doc-style-ff></doc-style-ff>

```imba
# ~preview=200px
import 'util/styles'
# ---
css @root
    # To override the default fonts or add new ones
    # simply specify --font-{name} in your styles:
    --font-sans: Arial # override sans
    --font-comic: Chalkboard, Comic Sans # add comic

imba.mount do  <section>
    <label[fs:xl ff:serif]> "This is serif"
    <label[fs:xl ff:sans]> "This is sans"
    <label[fs:xl ff:mono]> "This is mono"
    <label[fs:xl ff:comic]> "This is comic"
```

## Font Sizes

<doc-style-fs></doc-style-fs>

## Box Shadow

```imba
# ~preview=200px
import 'util/styles'
css body bg:gray1
css div c:gray6 size:14 bg:white radius:2 d:grid pa:center
css section.group px:6 jc:center gap:4 max-width:280px @xs:initial
# ---
css @root
    # To override the default shadows or add new ones
    # simply specify --box-shadow-{name} in your styles:
    --box-shadow-ring: 0 0 0 4px blue4/30, 0 0 0 1px blue4/90

imba.mount do  <section.group>
    <div[shadow:ring]> "ring" # custom
    <div[shadow:xxs]> "xxs"
    <div[shadow:xs]> "xs"
    <div[shadow:sm]> "sm"
    <div[shadow:md]> "md"
    <div[shadow:lg]> "lg"
    <div[shadow:xl]> "xl"
    <div[shadow:2xl]> "2xl"
    <div[shadow:ring,2xl]> "ring" # custom combo
    
```

## Border Radius

```imba
# ~preview=200px
import 'util/styles'
css body bg:gray1
css div c:gray6 fs:sm size:14 bg:white radius:2 d:grid pa:center border:1px solid gray3
css section.group px:6 jc:center gap:3
# ---
css @root
    # To override the default shadows or add new ones
    # simply specify --border-radius-{name} in your styles:
    --border-radius-bubble: 5px 20px 15px 

imba.mount do  <section.group>
    <div[radius:xs]> "xs"
    <div[radius:sm]> "sm"
    <div[radius:md]> "md"
    <div[radius:lg]> "lg"
    <div[radius:xl]> "xl"
    <div[radius:full]> "full"
    <div[radius:bubble]> "bubble"
```


## Easings

<doc-style-easings></doc-style-easings>

## Layouts

### Grid

The `grid` property behaves in a slightly special manner in Imba. If you supply a single value/identifier to this like `grid:container`, Imba will compile the style to `grid:var(--grid-container)`.

```imba
# ~preview=200px
css body p:2
css div bg:teal2 p:3
css section p:1 gap:2 pc:center

import {genres} from 'imdb'

# ---
# adding a custom grid with different values for different screen sizes
css @root
    --grid-cols: auto-flow / 1fr 1fr
    --grid-cols@xs: auto-flow / 1fr 1fr 1fr
    --grid-cols@sm: auto-flow / 1fr 1fr 1fr 1fr

# use this grid value anywhere in the code
imba.mount do  <section[display:grid grid:cols]>
    for genre in genres
        <div> genre
```

### Group

Row & column gaps are incredibly useful properties for adding consistent spacing between items inside grids. Even though these properties are promised to come for flexbox in the future, current support [is abysmal](https://caniuse.com/#feat=flexbox-gap). To alleviate some of this, imba includes `display:group` which is a shorthand to allow flexboxes that work with gaps.

```imba
# ~preview
import 'util/styles'

import {labels} from 'util/data'

let gap=2,inner=0
~hide[imba.mount do <#hud.bar>
    <span> 'gap'
    <input type='range' min=0 max=4 bind=gap/> <span.num> gap
    <span> 'inner'
    <input type='range' min=0 max=4 step=0.5 bind=inner/> <span.num> inner
]~
imba.mount do <main[p:8]>
    <section[d:grid ji:stretch gap:{gap}]>
        <div[d:group]> <input/> <button> 'Add'
        <div[d:group]> <input/> <input/> <input/>
        <div[d:group gap:{inner or gap}]> for item in labels
            <div.pill> item.name
```
The only way to get consistent gaps between elements inside flexboxes is to add margins around all their children (on all sides), and then add a negative margin to the container. This is what `display:group` does.

# - Specificity