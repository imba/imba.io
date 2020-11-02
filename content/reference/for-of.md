# for ... of

The for...of statement creates a loop iterating over iterable objects, including: built-in String, Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map, Set, and user-defined iterables. This maps directly to `for of` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) with a few convenient additions.


##### Iterating over an `Array` [snippet] [preview=console]
```imba
let iterable = [10,20,30]
for value of iterable
    console.log value
```

##### Iterating over a `String` [snippet] [preview=console]
```imba
let iterable = 'foo'
for value of iterable
    console.log value
```


##### Iterating over a `TypedArray` [snippet] [preview=console]
```imba
let iterable = new Uint8Array([0x00,0xff])
for value of iterable
    console.log value
```
##### Iterating over a `Map` [snippet] [preview=console]
```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry of iterable
    console.log entry

# destructuring
for [key,value] of iterable
    console.log value
```

##### Iterating over a `Set` [snippet] [preview=console]
```imba
let iterable = new Set([1, 1, 2, 2, 3, 3])
for value of iterable
    console.log value
```

##### Iterating over the arguments object [snippet] [preview=console]
```imba
def fn
    for arg of arguments
        arg * 2
console.log fn(1,2,3) # => [2,4,6]
```

##### Iterating with `index`
```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry,idx of iterable
    console.log entry,idx
for [key,value],idx of iterable
    console.log key,value,idx
```
> In Imba you can supply a second parameter to `for ... of`. This will be populated with the current iteration number (starting at 0), just like the second argument in `Array#map` and `Array#forEach`.