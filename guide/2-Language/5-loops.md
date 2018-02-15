# Loops

Loops in Imba behaves similar to array comprehensions in CoffeeScript and Python. They are expressions, and can be returned and assigned. When used as expressions they will always return an array (like Array#map, but with a few additional powerful features, like break / continue).

### for in
```imba
for num in [1,2,3]
    num * 2
```

### for of
```imba
for key,value of {a: 1, b: 2}
    value * 2
```

### while
```imba
while true
    break if Math.random < 0.1
```

### until
```imba
until Math.random < 0.1
    gamble
```


## For in

### loops are expressions
```imba
var list = [1,2,3,4,5]
var doubles = for num in [1,2,3]
    num * 2
```

### looping with index argument
```imba
for num,i in [1,2,3]
    num * i
```

### go through every other element
```imba
for num in [1,2,3] by 2
    num * 2
```

### filter by condition
```imba
for num in list when num > 1
    num
```

> **Tip!** Any type of object can support being iterated with forin in Imba. If the compiler does not know that the target is an array (at compiletime) it will look for (and call) `target.toArray` if it exists, and then loop through this.

## For of

### for of (all keys)
```imba
var object = {a: 1, b: 2, c: 3, d: 4}
# loop over all keys of object
for k,value of object
    value == 2
```

### for own of (own keys)
```imba
var obj = Object.create({a: 1, b: 1, c: 1})
obj:b = obj:d = 2

for own key,value of obj
    "{key} is {value}"
```

## Break / Continue

### Continue
```imba
for num in [1,2,3,4,5]
    continue if num == 3
    num * 2
```

### continue with expression
```imba
for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
```

### Break
```imba
for num in [1,2,3,4,5]
    break if num == 3
    num * 2
```

### Break with expression
```imba
for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
```
