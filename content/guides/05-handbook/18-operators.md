---
title: Operators
---
# Operators

##### Arithmetic
```imba
1 + 2 # Addition
3 - 2 # Subtraction
6 / 3 # Division
2 * 2 # Multiplication
5 % 2 # Remainder / Modulo
2 ** 2 # Exponential
-i # Unary negation
+i # Unary plus
```

##### Logical
```imba
expr1 && expr2 # Logical AND operator
expr1 || expr2 # Logical OR operator
!expr # Logical NOT operator
```

##### Assignment
```imba
item = 100 
item ||= 100 # If falsy assignment
item &&= 100 # If truthy assignment
item ?= 100 # If null assignment
item += 100 # Addition assignment
item -= 100 # Decrement assignment
item *= 100 # Multiplication assignment
item /= 100 # Division assignment
item %= 100 # Remainder assignment
item **= 100 # Exponential assignment
i++ # Increment assignment
i-- # Decrement assignment
```

##### Comparison
```imba
x == y # Equality
x != y # Inequality
x === y # Strict equality
x is y # Also strict equality
x !== y # Strict inequality
x isnt y # Also strict inequality
x > y # Greater than
x >= y # Greater than or equal
x < y # Less than
x <= y # Less than or equal
10 > x > 5 # Chained comparison
```

##### Bitwise Comparison
```imba
a & b # Bitwise AND
a | b # Bitwise OR
a ^ b # Bitwise XOR
~ a # Bitwise NOT
a << Left shift
a >> b Sign-propagating right shift
a >>> b Zero-fill right shift
```

##### Bitwise Assignment
```imba
a <<= 1 # Left shift assignment
a >>= 1 # Right shift assignment
a >>>= 1 # Unsigned right shift assignment
a &= 1 # Bitwise AND assignment
a |= 1 # Bitwise OR assignment
a ^= 1 # Bitwise XOR assignment
```

##### isa
```imba
honda isa Car # 
princess !isa Car 
```
> The `isa` operator tests whether the prototype property of a constructor appears anywhere in the prototype chain of an object. Alias for the javascript [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) operator.

##### delete
```imba
delete object.property
```