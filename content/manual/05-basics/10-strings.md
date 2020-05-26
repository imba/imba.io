---
title: Strings
---

# Strings

Imba supports strings as delimited by the `"` `'` characters.

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
