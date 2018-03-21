---
title: Functions
order: 3
---

# Functions

There are two types of functions in Imba, *methods* and *blocks*.

## Methods

```imba
def randomize
    Math.random
```

```imba
# A single argument
def square num
    num * num
```

```imba
# optional arguments
def call url, method = 'GET'
    # do something here
```

```imba
# Variadic arguments
def race winner, *rest
    "{winner} beat {rest.join(', ')}"
```

```imba
# Optional arguments, with callback
def save data, options = {}, &callback
    # do something here
```

```imba
# Named parameters
def animate values, ease: 'linear', duration: 1
    # do something here
```



## Blocks

```imba
var square = do |v| v * v
```

Blocks are like anonymous function expressions in JavaScript. They can be assigned and passed around. They have their own lexical scope / closure, but no dynamic scope. This means that self (implicit *and* explicit) inside the block still refers to the self of the outer scope.

Blocks can be passed in directly when calling functions, as the last argument.

```imba
[1,2,3,4].map do |num| num * 2

item.save do
    # callback trigger when item is saved?
    console.log 'item was saved'
```
