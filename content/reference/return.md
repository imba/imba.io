# return

## Syntax

### basic return [snippet]
```imba
def method
    return true
```

### implicit return [snippet]
```imba
def method
    true
```
> If you don't explicitly return for your methods - imba will by default return the value of the last expression.

### Implicit return

If you don't explicitly return for your methods - imba will by default return the value of the last expression.

## Examples

### implicit return list [preview]
```imba
def method params = [1,2,3]
    for item in params
        item * 2

console.log method(), method(10,20,30)
```
Remember that everything is an expression in imba, so even the result of loops will be implicitly returned unless otherwise stated