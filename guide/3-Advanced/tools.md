---
title: CLI
---

# CLI

Imba comes with three binaries imba, imbapack and imbac.

## imba

Utility for running imba scripts. Acts as a wrapper around node which can run .imba files (including requires).

`> imba sample.imba` will run the file sample.imba

## imbapack

This is a thin wrapper around webpack, and is the recommended way to build your imba projects. It takes all the same options as webpack, but injects the imba-loader and related extensions and module configuration. This means that you could create a plain webpack.config.js and just run `imbapack` instead of `webpack`. The config can include other loaders and plugins, imbapack should be able to inject the additional config correctly.

## imbac

`> imbac src/` will compile all imba files inside src (recursively). By default, Imba will look for a matching lib/ directory, and save the resulting files there. If no such directory exists, it will save the resulting js files in the same directories as their corresponding imba files.

`> imbac -o out.js input.imba` will compile the file input.imba to out.js

`> imbac -w -o lib/ src/` compiles all files in src to lib, and recopmiles when they are modified

All the other options can bee found by calling `> imbac --help`
