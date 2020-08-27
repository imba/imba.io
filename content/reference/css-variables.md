# css variables

Var

### Responsive variable values [preview]

Property modifiers are great for declaring multiple variations of variables.
```imba
global css @root
    --base:red @hover:blue
```

### Cascading variables

### Custom property fallback values
```imba
css .two
    # color should be red if --my-color is not defined
    color: var(--my-color,red)
```
