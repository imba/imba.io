# css inline styles

You can add inline styles on any element using `[style-properties]` syntax. You can think of this as an inlined anonymous class with a bunch of css properties.
Instead of coming up with an arbitrary class name and adding styles somewhere else, you can simply add them to elements directly:
```imba
<div[position:relative display:flex flex-direction:row padding:2rem]>
```
This might look like regular inline styles, but with abbreviations and modifiers they become much more powerful and expressive:

### Basic examples [preview=xl]
```imba main.imba
import 'util/styles'
# @show More padding on large screens
<button[pos:relative d:flex fld:row p:2 @md:4 @lg:6]> "Hello"
# @show Darker background color on hover
<button[bg:gray2 @hover:gray3]> "Click me"
# @show Set text color when input is focused
<input[color@focus:blue7] value="Hello">
```
### Conditional inline styles [preview]
Inline styles are essentially anonymous classes, they can also be applied conditionally
```imba
let done = no
imba.mount do <div[p:4]>
    <input type='checkbox' bind=done>
    # gray color only when done is truthy
    <span[p:2] [color:gray4]=done> "Checked?"
```