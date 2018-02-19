---
title: Introduction
order: 1
---

# Introduction

## What is Imba?

Imba is a new programming language for the web that compiles
to performant JavaScript. It is heavily inspired by ruby and python,
but developed explicitly for web programming (both server and client).
It has language level support for defining, extending, subclassing,
instantiating and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than [10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html)
with less code, and a much smaller library.

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

In this guide we will create a very simple application that highlights some features of Imba. Even though Imba is a full-fledged language capable for replacing JavaScript on the server, it *really* shines when working with tags. Our goal is initially to understand everything that is going on in this incredibly original todo list:

```imba
const app =
    title: ""
    items: []

    def addItem
        if self:title
            self:items.push(title: self:title)
            self:title = ""

    def toggleItem item
        item:completed = !item:completed

Imba.mount <div[app].vbox ->
    <header>
        <input[data:title] :keyup.enter.addItem>
        <button :tap.addItem> 'add item'
    <ul> for item in data:items
        <li .done=item:completed :tap.toggleItem(item)> item:title
```


Short introduction to general syntax of language here?
