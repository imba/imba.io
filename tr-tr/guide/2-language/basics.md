---
title: Basics
order: 1
---

# Temeller

Imba, her ne kadar anlamsal ve sözdizimi bakımından JavaScript'ten çok Ruby'ye benzese de, yalın JavaScript'i derler ve var olan JavaScript kütüphanesiyle mükemmel bir şekilde uyumluluk sağlar. Imba, JavaScript'i tam olarak değiştirmez. Diziler dizi, yazılar yazı, sayılar sayı, sınıflar prototipli yapıcılar vb. Basitçe anlatmak gerekirse; Imba'yı seviyorsanız ve npm paketinizin genel JavaScript ekosisteminde çalışması gerekiyorsa bile paketi Imba ile yazmamanız için hiçbir sebep yok. Doğruyu söylemek gerekirse Imba, *tam* okunabilir JavaScript'i yorumlarınızı ve kodlama stilinizi koruyarak size sunar.

### Birlikte Çalışabilirlik

Imba yalın olan JavaScript'i derler. Tüm temel şeyler, JavaScript'teki ile aynıdır. Mevcut yöntemlerle ilgili belgeler için bkz. [Nesne](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), [Fonksiyon](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function), [Yazı](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [Sayı](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), [Dizi](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), [Tarih](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), [Matematik](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math).

#### Yazılar

```imba
var tek = 'tek tırnak'
var cift = "çift tırnak"
var yaziyaDegiskenEkleme = "yazı {cift}'a sahip"
```

#### Sayılar

```imba
var tamSayi = 42
var kusuratliSayi = 42.10
```

#### Nesneler

```imba
var nesne = {name: 'Imba', type: 'Language'}
```


#### Diziler

```imba
var dizi = [1,2,3,4,5]
```

#### Kurallı İfadeler

```imba
var kuralliIfade = /sayı (\d+)/
```

#### Döngüler
```imba
for num in [1,2,3]
    num

for own key, value of object
    value
```

#### Fonksiyonlar

```imba
def merhaba
    return 'dünya'

console.log merhaba
```

#### Sınıflar

```imba
class Yapilacaklar

    def initialize title
        @title = title
        @completed = no

    def complete
        @completed = yes
```

#### Operatörler

```imba
var esya
esya = 100 # Eşya değişkeninin değerini belirler
esya ||= 100 # değerin yanlış olup olmadığını kontrol eder
esya &&= 100 # değerin zaten doğru olup olmadığını kontrol eder
esya ?= 100 # değerin tanımlanıp tanımlanmadığını veya boş olup olmadığını kontrol eder

# karşılaştırıcılar
esya == 10 # kontrol eder
esya === 10 # tamamen eşit
esya != 10 # eşit değil
esya !== item # tamamen eşit değil
esya > 10 # büyüktür
esya < 10 # küçüktür
esya >= 10 # büyük eşit
esya <= 10 # küçük eşit
```

#### Bitsel İşleçler

```imba
a & b   # Bitsel VE
a | b   # Bitsel YA DA
a ^ b   # Bitsel X YA DA
~ a     # Bitsel DEĞİL
a << b  # SOLA YAYMA
a >> b  # İŞARETİ SAĞA YAYMA
a >>> b # SIFIRA YAYMA
```
