# Control Flow

##### if
```imba
# indented
if condition
    console.log 'yes!'
```
> The if statement executes the indented code if a specified condition is truthy.

##### else
```imba
if condition
    console.log 'yes!'
else
    console.log 'no!'
```
> If the condition is falsy, code inside the connected else block will execute.

##### elif
```imba
if expr > 10
    console.log 'over 10'
elif expr > 5
    console.log 'over 5'
elif expr
    console.log 'not falsy'
```
> To conveniently chain multiple conditionals, use `elif`. No `elif` or `else` statements will be executed after the first truthy condition.



##### unless
```imba
unless condition
    console.log 'condition was not truthy'
```
> The unless statement executes the indented code if a specified condition is *not* truthy.


##### ternary
```imba
condition ? console.log('yes!') : console.log('no!')
```
> The [Ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) is a useful way to write compact if / else statements.


##### trailing if & unless
```imba
console.log 'yes' if condition
console.log 'no' unless condition
```
> If & unless can also be used at the end of a single line expression


## [TIP] If/else as expressions 

Almost everything in imba are expressions. So, you can theoretically return and assign an if statement:
```imba
let x = 7
let result = if x > 10
    'large'
elif x > 5
    if x % 2 == 0
        'medium even'
    else
        'medium odd'
else
    'small'
console.log result # 'medium odd'
```
This isn't to be abused, but can in many cases be practical.