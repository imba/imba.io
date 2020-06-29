# The friendly full-stack language

Imba features a clean and readable syntax inspired by ruby, compiles to performant JavaScript, and works inside the existing ecosystem.

[Code](/examples/applications/paint)

```imba
# ~preview
css div pos:absolute d:block inset:0 p:4
css button pos:absolute p:2 bg:teal2 radius:2
css li d:inline-block px:1 m:1 radius:2 fs:xs bg:gray1 @hover:blue2

let x = 0, y = 0

imba.mount do <div @mousemove=(x=e.x,y=e.y)>
    <p> "Mouse is at {x} {y}"
    <button[bg:teal2 x:{x} y:{y} rotate:{x / 360}]> "Item"
    <ul> for nr in [0 ... Math.min(x,y)]
        <li> nr
```