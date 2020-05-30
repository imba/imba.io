---
title: Strings
---

# Strings

Imba supports strings as delimited by the `"` `'` characters.

## String Literals

```imba
let single = 'single quotes'
let double = "double quotes"
let interpolation = "string has {double}"
```

##### Basic strings
```imba
'hello world'
```

##### String interpolation
```imba
"dynamic string {imba.version}"
```
> In JavaScript `${}` is used for interpolation. Imba uses `{}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`

##### Template strings
```imba
`dynamic string {imba.version}`
```
> In JavaScript `${}` is used for interpolation. Imba uses `{}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`


## Multiline String Literals

If you need a string that spans several lines and includes line breaks, use a multiline string literal—a sequence of characters surrounded by three quotation marks:

To preserve newlines, use `'''` or `"""`:
```imba
let string = '''
This string is written
over multiple lines
'''
# => 'This string\nis written over\nmultiple lines'
```

Multiline strings also preserves indentation, but only relative to the least indented line:

```imba
let string = '''
    First level is ignored
        This is indented
    Not indented
    '''
```

Regular string literals can also be written over multiple lines, but line breaks are simply ignored:
```imba
let string = 'one
two three'
# => 'onetwo three'
```

## Template literals
```imba
`string text`
# multiple lines
`string text line 1
 string text line 2`
# interpolated expression
`string text ${expression} string text`
# tagged template
method`string text ${expression} string text`
```


## String Interpolation

Inside double quoted strings you can interpolate expressions using `{}`.

```imba
let interpolation = "string has {double}"
```