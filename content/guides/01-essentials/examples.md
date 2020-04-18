---
title: Examples
order: 8
---

# Examples

## Filtering list

Testing

```imba
# get name of all properties on Element
var items = Object.keys(Element:prototype).sort

tag App
    prop query default: ""

    def render
        <self>
            # bind the input to our query property
            <input[query] type='text'>
            # render list with some inline css
            <ul css:height=200 css:overflow='auto'>
                # filter list while iterating
                for item in data when item.indexOf(query) >= 0
                    <li> item

Imba.mount <App[items]>
```


## Master - Details

```imba
# get name of all properties on Element
var notes = [
    {body: "First note"}
]

tag App
    prop note

    def addItem
        notes.unshift(body: "New Note")

    def render
        <self.hbox css:height=200>
            <aside>
                <ul> for item in notes
                    <li .selected=(note == item) :tap.setNote(item)>
                        <span> item:body
                <footer> <button :tap.addItem> "New note"
            if note
                <section> <textarea[note:body].full>

Imba.mount <App>
```


## Simple todo list
```imba
tag App
    prop items

    def addItem
        if @input.value
            items.push(title: @input.value)
            @input.value = ""

    def toggleItem item
        item:completed = !item:completed

Imba.mount <App.vbox items=[] ->
    <form.bar :submit.prevent.addItem>
        <input@input>
        <button> 'add'
    <ul> for item in items
        <li .done=item:completed :tap.toggleItem(item)> item:title
```

## More examples

### [Imba.io](https://github.com/somebee/imba.io)

This whole website is written in Imba. It uses the same code for server and client. After the initial load, all navigation in the browser is happening with history push/popState, and rendered directly on the client, yet any hard refresh should land you at the same spot when rendered from the server, thanks to using the same logic for routing as well. Grab it over at [GitHub](https://github.com/somebee/imba.io).

### [TodoMVC](https://github.com/somebee/todomvc-imba)

The basic Imba implementation of TodoMVC is a good place to start playing around.

### [Hello World](https://github.com/imba/hello-world-imba)

Tiny application with webpack/imbapack setup.
