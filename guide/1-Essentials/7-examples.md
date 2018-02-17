# Examples

## Filtering list

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