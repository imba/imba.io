---
title: Operators
---
# Operators

## Arithmetic

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

## Assignment

```imba
item = 100 
item ||= 100 # If falsy assignment
item &&= 100 # If truthy assignment
item ?= 100 # If null assignment
item += 100 # Addition assignment
i++ # Increment assignment
i-- # Decrement assignment
item -= 100 # Decrement assignment
item *= 100 # Multiplication assignment
item /= 100 # Division assignment
item %= 100 # Remainder assignment
item **= 100 # Exponential assignment

item <<= 1 # Left shift assignment
item >>= 1 # Right shift assignment
item >>>= 1 # Unsigned right shift assignment
item &= 1 # Bitwise AND assignment
item ^= 1 # Bitwise XOR assignment
item |= 1 # Bitwise OR assignment
```

## Comparison
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

## Unary
```imba
delete object.property # delete
!object.property # logical NOT
```
