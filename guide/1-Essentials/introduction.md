---
title: Introduction
order: 1
---

# Introduction

## What is Imba?

Imba is a new programming language for the web that compiles
to performant JavaScript. It is heavily inspired by ruby and python,
but developed explicitly for web programming (both server and client).
Imba treats DOM elements as a first-class citizens. These elements are compiled to an [inline dom](/guides/advanced/performance), which is an [order of magnitude faster](https://somebee.github.io/dom-reconciler-bench/index.html) than todays virtual dom implementations. We truly believe that it opens up for a new way of developing web applications.

```imba
var number = 42
var opposite = true
var string = "the answer is {number}"
var regex = /answer is (\d+)/

var info =
    name: 'Imba'
    version: Imba.VERSION
    repository: 'https://github.com/somebee/imba'
    inspiration: ['ruby','python','react','coffeescript']
    creator: 'Sindre Aarsaether'
    contributors: [
        'Sindre Aarsaether' # github.com/somebee
        'Magnus Holm' # github.com/judofyr
        'Slee Woo' # github.com/sleewoo
    ]
```

> Even though Imba has been used privately, in production, for more than a year (powering scrimba.com), the community is  in the early stages, and documentation is still sparse. We're incredibly grateful for any feedback, suggestions, and help with the documentation!

## Syntax & Semantics

Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain performant JavaScript, and is fully compatible with any existing JavaScript library. Imba does not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth. If you simply like Imba better, there is no reason not to write your npm package in Imba, even if it is supposed to be used in the general JavaScript ecosystem. In fact, Imba produces *very* readable JavaScript, by keeping your indentation, comments, and coding style.

```imba
# Strings
var single = 'single quotes'
var double = "double quotes"
var interpolation = "string has {double}"

# Numbers
var integer = 42
var float = 42.10

# Objects
var object = {name: 'Imba', type: 'Language'}

# Arrays
var array = [1,2,3,4,5]

# Regular expressions
var regex = /number is (\d+)/

# Functions
def hello
    console.log 'got here'
    return 'world'

# Classes
class Todo
    # automatic getter/setter declaration
    prop title

    def initialize title
        # instance variables
        @title = title
        @completed = no

    def complete
        @completed = yes

# Tags
var item = <div.header> "This is a div"
var list = <ul.list> for item in ["one","two","three"]
    <li> <span.name> item
```


## Getting started

> This guide assumes knowledge of HTML, CSS and JavaScript (or another programming language). It will be especially helpful to know React to grasp how tags and custom tags work.

The easiest way to get started with Imba is to play around in the [scrimba.com Hello World example](https://scrimba.com/c/cE4nGcg). If you rather want to try Imba in your own environment you can clone [hello-world-imba](https://github.com/somebee/hello-world-imba) and follow the instructions in the readme. There are plugins available for [Sublime Text](https://packagecontrol.io/packages/Imba), [VSCode](https://github.com/somebee/vscode-imba) and [Atom](https://atom.io/packages/language-imba).


