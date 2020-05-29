# Loops and Iteration

Loops in Imba behaves similar to array comprehensions in CoffeeScript and Python. They are expressions, and can be returned and assigned. When used as expressions they will always return an array (like Array#map, but with a few additional powerful features, like break / continue).

```imba
# basic for in
for num in [1,2,3]
    num * 2
```

```imba
# range loops using for in
for item in [0 ... 10] # exclusive
	item * 2
	
for item in [0 .. 10] # inclusive (0 - 10)
	item * 2
```

```imba
# iterate through keys of object
for own key,value of {a: 1, b: 2}
    value * 2
```

```imba
while true
    break if Math.random! < 0.1
```

```imba
until Math.random! < 0.1
    gamble!
```


## for in

For in is the basic syntax for looping through arrays. 

```imba
# looping with index argument
for num,index in [1,2,3]
    num * index
```

```imba
# loops are expressions
let list = [1,2,3,4,5]
let doubles = for num in [1,2,3]
    num * 2
```

##### For in by
```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

##### For in when
```imba
# filter by condition
for num in list when num > 1
    num
```

> **Tip!** Any type of object can support being iterated with forin in Imba. If the compiler does not know that the target is an array (at compile-time) it will look for (and call) `target.toIterable()` if it exists, and loop through the result of that.

## for of



The for...of statement creates a loop iterating over iterable objects, including: built-in String, Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map, Set, and user-defined iterables. For regular arrays `for in` will always be slightly more performant.


##### Iterating over an `Array`
```imba
let iterable = [10,20,30]
for value of iterable
    console.log value
```

##### Iterating over a `String`
```imba
let iterable = 'foo'
for value of iterable
    console.log value
```


##### Iterating over a `TypedArray`
```imba
let iterable = new Uint8Array([0x00,0xff])
for value of iterable
    console.log value
```
##### Iterating over a `Map`
```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry of iterable
    console.log entry

# destructuring
for [key,value] of iterable
    console.log value
```

One addition to native JavaScript `for of` is the option to add a second argument - which will represent the iteration number, much like the second argument in `Array#map` and `Array#forEach`.

> Coming from JS

## For own of

The `for own ... of` statement creates a loop iterating over key-value pairs of objects.

```imba
# loop over own keys of object
var obj = Object.create(a: 1, b: 1, c: 1)
obj.b = obj.d = 2

for own key,value of obj
    "{key} is {value}"
```

## Break & Continue

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

### Custom iterable

```imba
class Logger
    def toIterable
        ['a','b','c','d']

let log = new Logger
for entry in log
    entry

```