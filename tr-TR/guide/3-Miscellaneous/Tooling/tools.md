---
title: Komut Satırı Arayüzü
order: 7
---

# Komut Satırı Arayüzü

Imba, imba, imbapack ve imbac binaryleri ile birlikte gelir.

## imba

Imba, imba-scripts dosyalarını çalıştırmak için temel bir node sarmalayıcısıyla birlikte gelir. `imba`'yı, `node`'u kullandığınız gibi kullanın. Mevcut seçenekleri görebilmek için `imba` komutunu yanına argüman eklemeden çağırın.

> `imba app.imba` komutu kodu derleyip app.imba uygulamasını çalıştırır

## imbapack

The `imbapack` utility is a convenient wrapper around `webpack`, which preprocesses your config to include the necessary configurations for loading .imba files. It supports all the same options as `webpack` and will work with `webpack.config.js` files directly. When you use `imbapack` you do not need to declare an imba-loader and resolveExtensions in your configs.

> `imbapack app.imba bundle.js` compiles the file app.imba, **and all required files** into a webpack bundle named bundle.js. This file can be included in a html page like any other js-file. See [webpack](https://webpack.github.io) for more details.

> `imbapack --watch app.imba bundle.js` same as above, but recompiles whenever app.imba or any related files change.

## imbac

`> imbac src/` will compile all imba files inside src (recursively). By default, Imba will look for a matching lib/ directory, and save the resulting files there. If no such directory exists, it will save the resulting js files in the same directories as their corresponding imba files.

`> imbac -o out.js input.imba` will compile the file input.imba to out.js

`> imbac -w -o lib/ src/` compiles all files in src to lib, and recopmiles when they are modified

All the other options can bee found by calling `> imbac --help`

### Webpack Config

The `imbac` utility is for compiling your scripts to js. When working on client-side projects you should rather use `imbapack` but the the following configuration should be sufficient in most cases:

```js
{
  test: /\.imba$/,
  loader: 'imba/loader'
}
```
