# Functions

##### Defining functions
```imba
# defining a function
def square number
    number * number

# invoking a function
square(5)
# parenthesis are optional
square 5
```

##### Invoking with arguments
```imba
console.log(1,2,3)
# when invoking a function with arguments the parens are optional
console.log 1,2,3
```

##### Invoking with callback
```imba
[10,20,30,40].map do(num) num * 2
```

##### Invoking without arguments
```imba
document.location.reload!
```
> You are free to use empty parens `()` for invoking functions without arguments, but the preferred style in imba is to use the exclamation mark.

## Function Parameters

##### With default parameters
```imba
def multiply a, b = 1
    a * b
multiply(5)
```

##### Rest parameters
```imba
def multiply multiplier, ...numbers
    return (num * multiplier for num in numbers)
multiply(2,1,2,3) # [2,4,6]
```

##### Destructuring parameters
```imba
def draw {size = 'big', coords = {x:0, y:0}, radius = 25}
	console.log size,coords,radius

draw(coords: {x: 18, y:30},radius:30)
```

### Parameter references

Inside of a function `$0` always refers to the `arguments` object, and `$1`,`$2`,`$3`,`$n` refers to argument number 1,2,3 etc. This can come handy in many inline methods where you just want to access the first argument.
```imba
['a','b','c','d'].map do $1.toUpperCase!
# is essentially the same as writing
['a','b','c','d'].map do(item) item.toUpperCase!
```
> This might seem like a trivial difference, but in many cases you don't want the cognitive overload to come up with a sensible parameter name.

## Calling functions

> Optional parenthesis

### Without Arguments

Any method that can be


### Object Arguments

### Callback Arguments

A callback function is a function passed into another function as an argument. This is a common pattern in JavaScript. When passing a callback argument in Imba, you can write this after the function:

```imba
def update data, callback
    # post data to server ...
    callback! if callback

update(score: 1023) do
    console.log 'callback was called'
```

The general convention is to expect callbacks as the last argument. In the cases where this is not the case, you can represent the position of the callback argument using `&`. `setTimeout` is a built-in JavaScript function that expects the callback as the first argument. To call this in Imba you would write:

```imba
setTimeout(&,200) do console.log 'fired after 200ms'
```

A callback is just an anonymous function. When callbacks are called with arguments you simply declare parameters on the callback function:

```imba
def update data, callback
    # post data to server ...
    callback(null,response) if callback

update(score: 1023) do(err,resp)
    console.log 'response from update',resp
```
