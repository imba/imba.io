---
title: Classes
order: 5
---

# Sınıflar

## Tanım

```text
class Puan
    def initialize x,y
        @x = x
        @y = y
```

## Örnekler

Imba'da sınıf örnekleri oluşturmak için, JavaScript'e özel `new Array()` sözdiziminin aksine, `Array.new` örneğinde olduğu gibi `new` metodunu kullanırsınız. Bu, Imba'da oluşturulan sınıflara özel değildir, herhangi bir nesneyi oluşturmak için kullanılır. JavaScript'in içinde var olan `Dizi`, `Nesne`, `RegEx` ve diğer dillerde olan herhangi bir sınıf veya yapıcılarda da aynı şey geçerlidir.

## Özellikler

Otomatik olarak oluşturulan alıcılar ve ayarlayıcılar olan sınıfların özelliklerini tanımlayabilirsiniz. Daha önce de bahsedildiği gibi, Imba, sınıfların her şeyi metodlarla ortaya çıkarması gerektiği felsefesini benimser. JavaScript'te `Todo` unvanını almak veya ayarlamak istiyorsanız, doğrudan bir özellik olarak almak veya ayarlamak o kadar da imkansız değildir. Ancak Imba'da öyle yapmak yerine unvanı belirlemek için _metodlar_ tanıımlayabilirsiniz.

```text
class Yapilacaklar

    prop title
```

Yukarıdakiler temel olarak bir örneğin başlığını tanımlamak için bir alıcı ve bir ayarlayıcı oluşturmanın hızlı yoludur.

```text
class Yapilacaklar

    def title
        @title

    def title= value
        @title = value
```

> **TODO**, `prop` ve `attr`'ın gelişmiş özelliklerini açıklar.

## Kalıtsallık

Sınıflar, diğer sınıflardan kalıtsallık alabilir. Bu uygulama, bazı ek kolaylıklar içeren JavaScript'in prototipik kalıtımına dayanır.

```text
# Örnek coffeescript.org'dan alınmıştır
class Animal

    def initialize name
        @name = name

    def move meters
        console.log "{@name} moved {meters}m."

class Snake < Animal
    def move
        console.log "Slithering..."
        super 5

class Horse < Animal
    def move
        console.log "Galloping..."
        super 45

var sam = Snake.new "Sammy the Python"
var tom = Horse.new "Tommy the Palomino"

sam.move
tom.move
```

> **TODO** Örnek, "super" kullanımını ileri düzeyde açıklar

