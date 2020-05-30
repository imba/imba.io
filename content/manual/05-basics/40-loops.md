# Loops and Iteration

Loops in Imba behaves similar to array comprehensions in CoffeeScript and Python. They are expressions, and can be returned and assigned. When used as expressions they will always return an array.

##### for in
```imba
let ary = [1,2,3]
for num,index in ary
    console.log num * index
```
> Basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`

##### for of
```imba
let iter = new Set([1, 2, 3])
for value of iter
    value
```
> Iterating over iterable objects following the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) added in ES2015.

##### for own of
```imba
let obj = {a:1, b:2, c:3}
for own key,value of obj
    "{key} is {value}"
```
> Convenient syntax for looping through key-value pairs of objects.

## Loops as expressions

One important difference from JavaScript is that loops can behave as expressions. This means that you can assign them to variables, return them from methods, and everything you could do with other expressions. When used as expressions these loops returns an array containing the result of every iteration of the loop.

```imba
let items = for num in [1,2,3]
    num * 2
console.log items # => [2,4,6]
```
Using this in combination with `break`, `continue` and conditionals makes for very concise ways to loop through, map, and filter iterables in one operation.
```imba
import {movies} from 'imdb'

let hits = for movie,index in movies
    continue unless movie.genres.includes('Drama')
    continue if movie.rating < 8.8
    [index + 1,movie.title]
console.log hits

# let dramas = (mov.title for mov in movies when mov.genres.includes('Drama'))
# console.log dramas
```

## For ... in

> Imba `for in` is not to be confused with `for in` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in).

For in is the basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`. This includes `Array`, `NodeList`, `DOMTokenList`, `String` and more. It was created before `for of` iterables became standard in ES2015, but is still a practical alternative to using `for of` in many cases.

##### for in
```imba
for num in [1,2,3]
    num
```

##### with optional index parameter
```imba
for num,index in [1,2,3]
    num * index
# [1,4,9]
```

##### specifying increment with `by`
```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

##### inclusive range `..`
```imba
# from 0 up to (including) 3
console.log for num in [0 .. 3]
    num
# [0,1,2,3]
```

##### exclusive range `...`
```imba
# from 0 up to (excluding) 3
for num in [0 ... 3]
    num
# [0,1,2]
```
> Ranges **must include spaces** around `..` and `...`

##### toIterable
```imba
class LabelString
    def constructor label
        label = label

    def toIterable
        console.log 'called toIterable'
        label.split(',')

let labels = new LabelString 'idea,proposal,duplicate'

for label in labels
    console.log label.toUpperCase!
```

> When Imba cannot infer that an object is an array during compilation it will behind the scenes look for a `toIterable` method on the object before looping. This way one can make any type of object easily support being iterated using a `for in` loop.

## For ... of

The for...of statement creates a loop iterating over iterable objects, including: built-in String, Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map, Set, and user-defined iterables. This maps directly to `for of` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) with a few convenient additions.


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

##### Iterating over a `Set`
```imba
let iterable = new Set([1, 1, 2, 2, 3, 3])
for value of iterable
    console.log value
```

##### Iterating over the arguments object
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
> In imba you can supply a second parameter to `for ... of`. This will be populated with the current iteration number (starting at 0), just like the second argument in `Array#map` and `Array#forEach`.


## For own ... of

One pretty common need is to loop through the key-value pairs of plain objects. The commonly recommended way to do this in JavaScript is:
```javascript
let obj = {a: 1, b: 2, c: 3}
for (const key of Object.keys(obj)) {
    console.log(`${key} is ${obj[key]}`);
}
```
Since this is a relatively common pattern - Imba has specific support for this using `for own of`. This statement creates a loop iterating over key-value pairs of objects.

```imba
let obj = {a: 1, b: 2, c: 3}
for own key,value of obj
    console.log "{key} is {value}"
```

## Break, Continue & When

> `break`, `continue` & `when` is supported in all loop types (`for in`, `for of` and `for own of`)

##### break
```imba
var res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# [2,4]
```

##### continue
```imba
let res = for num in [1,2,3,4,5]
    continue if num == 3
    num * 2
console.log res # [2,4,8,10]
```

##### when
```imba
const res = for num of [1,2,3,4,5] when num != 3
    num * 2
console.log res # [2,4,8,10]
```
> `when` is essentially a shorthand for continuing past values that don't match a condition.

##### continue *value*
```imba
var res = for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
# continue with an argument acts like early return within Array#map
# res => [2,4,-1,8,10]
```
> When supplying an argument to continue, this value will be added to the resulting array, much like an early return would do in an `Array#map` function.

##### break *value*
```imba
# break with argument
var res = for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
res == [2,4,-1]
```
> When supplying an argument to break, this value will be added to the resulting array. Especially useful when you want to return until some condition is met, but also want to include the item at which condition was met.

## Questions

### Why use `for in` as opposed to Array#map?

It may look weird to assign from a `for` loop to a variable like: `var x = for val in items ...`.
- It supports mapping through any iterable object - not just arrays
- It is possible to skip / continue past items during map - instead of filtering before or after mapping.
- It is possible to break out of the map at any time
- It is more performant due to not adding anything to the stack


- Remember that imba uses implicit return - so a loop at the end of a method will return the result of the loop.