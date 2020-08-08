# for own ... of

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