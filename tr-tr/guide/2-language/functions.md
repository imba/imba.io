---
title: Fonksiyonlar
order: 3
---

# Fonksiyonlar

There are two types of functions in Imba, _methods_ and _blocks_. Imba automatically returns the last expression of the function.

## Yöntemler

```text
def randomize
    Math.random
```

```text
# A single argument
def square num
    num * num
```

```text
# optional arguments
def call url, method = 'GET'
    # do something here
```

```text
# Variadic arguments
def race winner, *rest
    "{winner} beat {rest.join(', ')}"
```

```text
# Optional arguments, with callback
def save data, options = {}, &callback
    # do something here
```

```text
# Named parameters
def animate values, ease: 'linear', duration: 1
    # do something here
```

## Bloklar

```text
var square = do |v| v * v
```

Blocks are like anonymous function expressions in JavaScript. They can be assigned and passed around. They have their own lexical scope / closure, but no dynamic scope. This means that self \(implicit _and_ explicit\) inside the block still refers to the self of the outer scope.

Blocks can be passed in directly when calling functions, as the last argument.

```text
[1,2,3,4].map do |num| num * 2

item.save do
    # callback trigger when item is saved?
    console.log 'item was saved'
```

