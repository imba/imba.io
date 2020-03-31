---
title: Loops
order: 4
---

# Loops

Loops in Imba behaves similar to array comprehensions in CoffeeScript and Python. They are expressions, and can be returned and assigned. When used as expressions they will always return an array (like Array#map, but with a few additional powerful features, like break / continue).

```imba
# basic for in
for num in [1,2,3]
    num * 2
```

```imba
# range loops using for in
for item in [0...10] # exclusive
	item * 2
	
for item in [0..10] # inclusive (0 - 10)
	item * 2
```

```imba
# iterate through keys of object
for key,value of {a: 1, b: 2}
    value * 2
```

```imba
while true
    break if Math.random < 0.1
```

```imba
until Math.random < 0.1
    gamble
```


### For in

```imba
# looping with index argument
for num,i in [1,2,3]
    num * i
```

```imba
# loops are expressions
var list = [1,2,3,4,5]
var doubles = for num in [1,2,3]
    num * 2
```

```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

```imba
# filter by condition
for num in list when num > 1
    num
```

> **Tip!** Any type of object can support being iterated with forin in Imba. If the compiler does not know that the target is an array (at compile-time) it will look for (and call) `target.toArray` if it exists, and then loop through this.

### For of

```imba
# loop over all keys of object
var object = {a: 1, b: 2, c: 3, d: 4}
for k,value of object
    value == 2
```

```imba
# loop over own keys of object
var obj = Object.create({a: 1, b: 1, c: 1})
obj:b = obj:d = 2

for own key,value of obj
    "{key} is {value}"
```

### Continue

```imba
var res = for num in [1,2,3,4,5]
    continue if num == 3
    num * 2

# continue without arguments
# res => [2,4,8,10]
```

```imba
var res = for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
# continue with an argument
# acts like early return within map
# res => [2,4,-1,8,10]
```

### Break

```imba
# break without argument
var res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
res == [2,4]
```

```imba
# break with argument
var res = for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
res == [2,4,-1]
```
