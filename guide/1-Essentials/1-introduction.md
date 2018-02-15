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

> Even though Imba has been used privately, in production, for more than a year (powering scrimba.com), the community is  in the early stages, and documentation is still sparse. If you are a person who takes joy in learning new technologies and are not afraid to learn by doing, please keep reading.


## Getting started

> This guide assumes knowledge of HTML, CSS and JavaScript (or another programming language). It will be especially helpful to know React to grasp how tags and custom tags work.

The easiest way to get started with Imba is to play around in the [scrimba.com Hello World example](https://scrimba.com/c/cE4nGcg). If you rather want to try Imba in your own environment you can clone [hello-world-imba](https://github.com/somebee/hello-world-imba) and follow the instructions in the readme. There are plugins available for [Sublime Text](https://packagecontrol.io/packages/Imba), [VSCode](https://github.com/somebee/vscode-imba) and [Atom](https://atom.io/packages/language-imba).

In this guide we will create a very simple application that highlights some of features of Imba. Even though Imba is a full-fledged language capable for replacing JavaScript on the server, it *really* shines when working with tags. Our goal is initially to understand everything that is going on in this incredibly original todo list:

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
        <input model.trim='title' :keyup.enter.addItem>
        <button :tap.addItem> 'add item'
    <ul> for item in data:items
        <li .done=item:completed :tap.toggleItem(item)> item:title
```


Short introduction to general syntax of language here?
