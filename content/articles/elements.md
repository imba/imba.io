

```imba
var highlight = true
var color = 'blue'
var name = 'Example'
var state = 'ready'

imba.mount do <section title=name>
    # Setting plain properties
    <input type='text' placeholder='Your name...'>
    # Setting classes
    <div.font-bold> "Bold text"
    # multiple classes
    <div.font-bold.font-serif.p-2> "Bold, serif & padded"
    # Conditional classes
    <div .font-bold=highlight> "Bold if highlight == true"
    <div .font-bold=!highlight> "Bold if highlight == false"
    # Dynamic classes
    <div .state-{state}> "Box with {color} text - in state {state}"
    <div .text-{color}-500 .{state}> "Box with {color} text - in state {state}"
```
