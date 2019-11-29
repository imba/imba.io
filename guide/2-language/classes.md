---
title: Classes
order: 5
---

# Classes

## Declaration

```text
class Point
    def initialize x,y
        @x = x
        @y = y
```

## Instances

To create instances of classes in Imba you use the `new` method like `Array.new`, as opposed to the special `new Array()` syntax in JavaScript. This is not special for classes created in Imba, but is used for creating any object, be it built in constructors in JavaScript like `Array`, `Object`, `RegEx` and any other class/constructor from other languages.

## Properties

You can define properties on classes, which are automatically generated getters and setters. As mentioned earlier, Imba embraces the philosophy that classes should expose everything through methods. If you want to get/set the title of a `Todo` in JavaScript, it's not uncommon to just get/set it as a property directly. In Imba, you would want to instead define _methods_ to set and get the title.

```text
class Todo

    prop title
```

The above is basically a quick way to define both a getter and a setter for the instance variable title.

```text
class Todo

    def title
        @title

    def title= value
        @title = value
```

> **TODO** Explain advanced features of `prop` and `attr`.

## Inheritance

Classes can inherit from other classes. The implementation relies on JavaScript prototypal inheritance, with some added conveniences.

```text
# Example borrowed from coffeescript.org
class Animal

    def initialize name
        @name = name

    def move meters
        console.log "{@name} moved {meters}m."

class Snake < Animal
    def move
        console.log "Slithering..."
        super 5

class Horse < Animal
    def move
        console.log "Galloping..."
        super 45

var sam = Snake.new "Sammy the Python"
var tom = Horse.new "Tommy the Palomino"

sam.move
tom.move
```

> **TODO** Explain advanced use of super

