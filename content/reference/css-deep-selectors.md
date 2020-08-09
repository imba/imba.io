# css deep selectors

```imba
# ~preview=lg
# ---
tag app-item
    <self> <p> "Nested Paragraph"

tag app-root
    css p fw:600
    <self>
        <div> <p> "Bold Paragraph"
        <div> <app-item>
        <div innerHTML='<p>Normal Paragraph<p>'>
        
# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```
As you can see in the example above, the literal `<p>` inside `app-root` is styled by the scoped rule, while the `<p>` inside the nested `<app-item>`, and the `<p>` generated via innerHTML are *not* styled.

There are some cases where you don't want this strict scoping though. Imagine a component that renders markdown or really need to override styles for nested components. This can be done with two special nesting operators.

##### >>>

```imba
# ~preview=lg
# these are global -- applies to everything in project
tag app-item
    <self> <p> "Nested Paragraph"
# ---
tag app-root
    css div p fw:600
    css div >>> p c:blue6 

    <self>
        <div> <p> "Literal"
        <div> <app-item>
        <div innerHTML='<p>Generated<p>'>
# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```
> The `>>>` operator signifies that everything after should 'escape' from the literal confines of the tag.

##### >>

```imba
# ~preview=lg
# these are global -- applies to everything in project
tag app-item
    <self> <p> "Nested Paragraph"
# ---
tag app-root
    css div p fw:600
    css div >> p c:blue6 

    <self>
        <div> <p> "Literal"
        <div> <app-item>
        <div innerHTML='<p>Generated<p>'>
# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```
> The `>>` operator styles immediate children, just like the `>` operator, but it also targets non-literal immediate children.