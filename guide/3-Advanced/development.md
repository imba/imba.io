---
title: Development
order: 1
---

# Development

All the code for the language is available on [GitHub](https://github.com/imba/imba)

```bash
# use https
git clone https://github.com/imba/imba.io
# or ssh
git@github.com:imba/imba.io.git
```

## Making Changes

If you are going to fix a new bug or add enhancement, please make sure to
update the test suite with cases covering your code. Depending on your changes
you might just need to expand one of the [existing
tests](https://github.com/imba/imba/tree/master/test). If you need to create a
whole new test take a look at the
[test/index.imba](https://github.com/imba/imba/blob/master/test/index.imba).

## Running the Tests

There are several scripts for running the tests. The CI will run all of them
but you can save yourselves some cycles by running them locally and fixing it
all up before opening a pull request.

## Test Imba

```bash
yarn run test
```

## Imbapack and Webpack Tests

```bash
yarn run test-webpack
```

## Google Chrome Tests via Puppeteer

```bash
yarn run test-chrome
```

