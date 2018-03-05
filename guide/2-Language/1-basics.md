---
title: Basics
order: 1
---

# Basics

Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain performant JavaScript, and is fully compatible with any existing JavaScript library. Imba does not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth. If you simply like Imba better, there is no reason not to write your npm package in Imba, even if it is supposed to be used in the general JavaScript ecosystem. In fact, Imba produces *very* readable JavaScript, by keeping your indentation, comments, and coding style.

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
    log 'got here'
    return 'world'

log hello
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

# ?= set if value is null/undefined.
item ?= 100

# &= set if value is null/undefined.
item &= 100

```
