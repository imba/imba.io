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