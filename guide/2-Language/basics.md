---
title: Basics
order: 1
---

# Basics

Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain performant JavaScript, and is fully compatible with any existing JavaScript library. Imba does not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth. If you simply like Imba better, there is no reason not to write your npm package in Imba, even if it is supposed to be used in the general JavaScript ecosystem. In fact, Imba produces *very* readable JavaScript, by keeping your indentation, comments, and coding style.

### Interoperability

Imba compiles to very straight-forward JavaScript. All the fundamental types are the same as in JavaScript, so for documentation about available methods see MDN [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function), [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), [Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math).

#### Strings

```imba
var single = 'single quotes'
var double = "double quotes"
var interpolation = "string has {double}"
```

#### Numbers

```imba
var integer = 42
var float = 42.10
```

#### Objects

```imba
var object = {name: 'Imba', type: 'Language'}
```


#### Arrays

```imba
var array = [1,2,3,4,5]
```

#### Regexes

```imba
var regex = /number is (\d+)/
```

#### Loops
```imba
for num in [1,2,3]
    num

for own key, value of object
    value
```

#### Functions

```imba
def hello
    return 'world'

console.log hello
```

#### Classes

```imba
class Todo

    def initialize title
        @title = title
        @completed = no

    def complete
        @completed = yes
```

#### Operators

```imba
var item
item = 100 # set value of item
item ||= 100 # set if value is falsy
item &&= 100 # set if value is already truthy
item ?= 100 # set if value is null or undefined

# comparators
item == 10 # check
item === 10 # strictly equal
item != 10 # not equal
item !== item # strictly not equal
item > 10 # greater than
item < 10 # less than
item >= 10 # greater than or equal
item <= 10 # less than or equal
```
