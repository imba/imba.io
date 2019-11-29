---
title: Switch
order: 9
---

# Switch

Imba'da "Switch" kodunu iki farklı şekilde kullanabilirsiniz:

```text
var number = 1
var numberString = switch number
  when 0
    "zero"
  when 1
    "one"
  else
    "not 1 nor 0"

# sıkışık şekilde
var numberString2 = switch number
  when 0 then "zero"
  when 1 then "one"
  else "not 1 nor 0"

# Aynı zamanda ikisini aynı anda kullanabilirsiniz
var numberString3 = switch number
  when 0 then "zero"
  when 1
    "one"
  else "not 1 nor 0"
```

Gördüğünüz gibi, `else` ifadesi `default` olarak kullanılmış. Daha anlaşılabilir değil mi?

