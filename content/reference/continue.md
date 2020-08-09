# continue

The continue statement terminates execution in the current iteration of the loop and continues execution of the loop with the next iteration.

### Continue in loop [preview=console]
```imba
for item in [1,3,5]
    continue if item == 3
    console.log item
    
```

Loops are expressions and return an array consisting of the values of each loop iteration. When you break in a loop, it will not add any more items to the resulting array.
```imba main.imba
let ary = for item in [1,2,3,4,5]
    continue if item == 3
    item
console.log ary
```
You can include an argument to break, which will them be included in the results.
```imba main.imba
let ary = for item in [1,2,3,4,5]
    continue 'special' if item == 3
    item * 2
console.log ary
```