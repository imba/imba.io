---
title: Literal Types
multipage: true
---

# Null

The value `null` represents the intentional absence of any object value. It is one of JavaScript's primitive values and is treated as falsy for boolean operations.

# Boolean

```imba
let bool1 = true
let bool2 = yes
let bool3 = false
let bool4 = no
```

# String

Imba supports strings as delimited by the `"` `'` characters.

## String Literals

```imba
let single = 'single quotes'
let double = "double quotes"
let interpolation = "string has {double}"
```

##### Basic strings
```imba
'hello world'
```

##### String interpolation
```imba
"dynamic string {imba.version}"
```
> In JavaScript `${}` is used for interpolation. Imba uses `{}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`

##### Template strings
```imba
`dynamic string {imba.version}`
```
> In JavaScript `${}` is used for interpolation. Imba uses `{}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`


## Multiline String Literals

If you need a string that spans several lines and includes line breaks, use a multiline string literal—a sequence of characters surrounded by three quotation marks:

To preserve newlines, use `'''` or `"""`:
```imba
let string = '''
This string is written
over multiple lines
'''
# => 'This string\nis written over\nmultiple lines'
```

Multiline strings also preserves indentation, but only relative to the least indented line:

```imba
let string = '''
    First level is ignored
        This is indented
    Not indented
    '''
```

Regular string literals can also be written over multiple lines, but line breaks are simply ignored:
```imba
let string = 'one
two three'
# => 'onetwo three'
```

## Template literals
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


## String Interpolation

Inside double quoted strings you can interpolate expressions using `{}`.

```imba
let interpolation = "string has {double}"
```

# Number

The Number type is identical to Number in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

##### Syntax
```imba
let integer = 42
let float = 42.10
let hex = 0x00
let binary = 0b0010110
```

##### With numeric separator
```imba
let budget = 120_000_000
let spent = 123_150_077.59
let hex = 0xA0_B0_C0
let binary = 0b0010_1100
```

```imba
const biggestNum     = Number.MAX_VALUE
const smallestNum    = Number.MIN_VALUE
const infiniteNum    = Number.POSITIVE_INFINITY
const negInfiniteNum = Number.NEGATIVE_INFINITY
const notANum        = Number.NaN
```

# RegExp

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

# Object

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

# Array

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

# Element

DOM nodes are first-class citizens in Imba, meaning that they can be instantiated using a literal syntax. They are *actual DOM elements*. We are not using a virtual DOM.

##### Create element
```imba
let el = <div.main title='example'> "Hello world"
document.body.appendChild el
```

##### Element with children
```imba
<div> <ul>
	<li.one> <span> 'one'
	<li.two> <span> 'two'
	<li.three> <span> 'three'
```



## Properties

##### Setting properties
```imba
<input type="text" value=window.title placeholder="title...">
```
> Properties are set using `prop=value` syntax.

##### Setting ID `#id`
```imba
<section#main> "..."
```

##### Adding classes `.classname`
```imba
<div.note.editorial> "Decent example"
```
> Classes are set using a `.classname` syntax reminicent of css.

##### Toggling classes `.classname=condition`
```imba
<div.note.editorial .resolved=data.isResolved> "Decent example"
```
> You can conditionally set classes using the `.classname=condition` syntax, where classes will only be added to the element when `condition` is truthy.

##### Adding dynamic classes `.class{name}`
```imba
let marks = 'rounded important'
let state = 'done'
let color = 'blue'
<div.item .{marks} .{state} .bg-{color}-200>
```
> To set dynamic classes you can use `{}` interpolation.


##### Setting references
```imba
<section$main title='Main Section'> "..."
```
> See more about Tag references

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

Since imba uses indentation for nesting and closing tags - some patterns could feel a little weird:
```imba
<div>
    "This is "
    <b> "very"
    " important"
```
Luckily, you can just use string interpolation:
```imba
<div> "This is {<b> "very"} important"
```
Also, if you explicitly close your elements using `/>` at the end, you can add multiple elements after one another without problem:
```imba
<label> <input type='checkbox'/> 'Dark Mode'
```
```imba
<button> <img title='icon'/> <span> 'Dark Mode'
```

## Control Flow

Since tags are first-class citizens in the language, logic works here as in any other code:

##### If / else
```imba
var seen = true
<div>
	if seen
		<span> "Now you see me"
	else
		<span> "Nothing to see here"
```

##### Ternary
```imba
# FIXME
var seen = true
<div> <span> seen ? "Now you see me" : "Nothing to see here"
```


If we have a dynamic list we can simply use a `for in` loop:

```imba
import {movies} from 'imdb'

# ---
<ul> for movie in movies.slice(0,10)
	<li> movie.title
```

Here's an example with more advanced logic:

```imba
import {movies} from 'imdb'

# ---
<div>
	for movie,i in movies when i < 10
		# add a separator before every todo but the first one
		<hr> if i > 0
		<div>
			<span.name> movie.title
            <ul.categories> for cat in movie.catogories
                <li> cat
```

> `for of` and `for own of` loops also supported for iteration

## Dynamic type

```imba
let type = 'section'
let el = <{type}.main title='example'> "This is a section"
```

## Styling

...