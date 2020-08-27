# css grids

The `grid` property gets special treatment in Imba. If you supply a single word to the `grid` property like `grid:cols`, Imba will compile that down to `grid:var(--grid-cols)` in css. This allows us to predeclare grids for our project and concisely reuse them across our styles.

### Basic example [preview=xl]
```imba
css body p:2
css div bg:teal2 p:3
css section p:1 gap:2 pc:center

import {genres} from 'imdb'

# ---
global css @root
    --grid-cols: auto-flow / 1fr 1fr

imba.mount do
    # use grid:cols anywhere in your project
    <section[display:grid grid:cols p:4]>
        for genre in genres
            <div> genre
```

### Responsive example [preview=xl]

In combination with css modifiers, especially breakpoints for different screen sizes, we can then create reusable responsive grids very easily. 

```imba
css body p:2
css div bg:teal2 p:3
css section p:1 gap:2 pc:center

import {genres} from 'imdb'

# ---
global css @root
    --grid-cols: auto-flow / 1fr 1fr
    --grid-cols@xs: auto-flow / 1fr 1fr 1fr
    --grid-cols@sm: auto-flow / 1fr 1fr 1fr 1fr
    --grid-cols@md: auto-flow / 1fr 1fr 1fr 1fr 1fr

imba.mount do
    <section[display:grid grid:cols p:4]>
        for genre in genres
            <div> genre
```