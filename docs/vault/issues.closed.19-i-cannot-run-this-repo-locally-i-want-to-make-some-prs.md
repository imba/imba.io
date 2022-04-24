---
id: uoqz14a8r0w6syn01tgp4u9
title: 19 I Cannot Run This Repo Locally I Want to Make Some Prs
desc: ''
updated: 1646819388337
created: 1646819388337
url: 'https://github.com/imba/imba.io/issues/19'
status: CLOSED
issueID: MDU6SXNzdWU0NDU3NzkyODQ=
author: 'https://github.com/ericvida'
---
I follow the steps in the Read me file, and it doesn't run.
As soon as I open localhost:3011 on the browser the browser and terminall will show error.
On Browser
```
TypeError: Cannot read property 'toString' of undefined
    at Renderer.renderer.code (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:219:22)
    at Parser.tok (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:999:28)
    at Parser.parse (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:944:17)
    at Object.exports.render.self.render (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:298:23)
    at add (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:33:18)
    at add (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:27:5)
    at new Guide (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:63:2)
    at Function.Guide.get (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:70:33)
    at /Users/eric/dev/git/imba-org/imba.io/src/server.imba:32:20
    at Layer.handle [as handle_request] (/Users/eric/dev/git/imba-org/imba.io/node_modules/express/lib/router/layer.js:95:5)
```


On Terminal
```
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.stop' } .stop
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.prevent' } .prevent
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.silence' } .silence
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.self' } .self
error compiling undefined
error?! { [Error: Parse error at [3:1]: Unexpected '.']
  error: { message: 'Parse error at [3:1]: Unexpected \'.\'' },
  message: 'Parse error at [3:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens:
      [ [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 3,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'tag.trigger(name, data = null)' } tag.trigger(name, data = null)
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.classname' } .classname
error compiling undefined
error?! { [Error: Parse error at [4:2]: Unexpected 'FORIN']
  error: { message: 'Parse error at [4:2]: Unexpected \'FORIN\'' },
  message: 'Parse error at [4:2]: Unexpected \'FORIN\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: 'FORIN',
        _value: 'in',
        _loc: 4,
        _len: 2,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'FORIN',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'for in' } for in
error compiling undefined
error?! { [Error: Parse error at [5:0]: Unexpected 'TERMINATOR']
  error:
   { message: 'Parse error at [5:0]: Unexpected \'TERMINATOR\'' },
  message: 'Parse error at [5:0]: Unexpected \'TERMINATOR\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token] ],
     token:
      Token {
        _type: 'TERMINATOR',
        _value: '\n',
        _loc: 5,
        _len: 0,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'TERMINATOR',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'await' } await
error compiling undefined
error?! { [Error: inconsistent    indentation]
  error:
   { SyntaxError: inconsistent    indentation
       at Lexer.error (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:2176:12)
       at Lexer.lineToken (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:1480:18)
       at Lexer.basicContext (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:384:138)
       at Lexer.parse (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:375:109)
       at Lexer.tokenize (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:351:7)
       at Object.exports.tokenize.self.tokenize (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/compiler.js:29:20)
       at Object.exports.compile.self.compile (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/compiler.js:78:21)
       at Object.exports.compile.self.compile (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/index.js:25:18)
       at Renderer.renderer.code (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:190:18)
       at Parser.tok (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:999:28) line: undefined },
  message: 'inconsistent    indentation',
  filename: undefined,
  line: undefined,
  _options:
   { tokens:
      [ [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token] ],
     pos: 14 },
  region: [ 57, 57 ],
  _code:
   'var number = 1\nvar numberString = switch number\n  when 0\n\t"zero"\n   when 1\n\t"one"\n   else\n\t"not 1 nor 0"\n\n# compact \nvar numberString2 = switch number\n  when 0 then "zero"\n  when 1 then "one"\n  else "not 1 nor 0"\n\n# you can also mix them\nvar numberString3 = switchnumber\n  when 0 then "zero"\n  when 1\n\t"one"\n  else "not 1 nor 0"' } var number = 1
var numberString = switch number
  when 0
        "zero"
   when 1
        "one"
   else
        "not 1 nor 0"

# compact
var numberString2 = switch number
  when 0 then "zero"
  when 1 then "one"
  else "not 1 nor 0"

# you can also mix them
var numberString3 = switch number
  when 0 then "zero"
  when 1
        "one"
  else "not 1 nor 0"
TypeError: Cannot read property 'toString' of undefined
    at Renderer.renderer.code (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:219:22)
    at Parser.tok (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:999:28)
    at Parser.parse (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:944:17)
    at Object.exports.render.self.render (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:298:23)
    at add (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:33:18)
    at add (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:27:5)
    at new Guide (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:63:2)
    at Function.Guide.get (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:70:33)
    at /Users/eric/dev/git/imba-org/imba.io/src/server.imba:32:20
    at Layer.handle [as handle_request] (/Users/eric/dev/git/imba-org/imba.io/node_modules/express/lib/router/layer.js:95:5)
^C
~/d/g/i/imba.io ❯❯❯ npm run start                                ✘ 130

> imba.io@1.0.0 start /Users/eric/dev/git/imba-org/imba.io
> imba ./src/server.imba

server is running on port 3011
error compiling undefined
error?! { [Error: Parse error at [3:0]: Unexpected 'TERMINATOR']
  error:
   { message: 'Parse error at [3:0]: Unexpected \'TERMINATOR\'' },
  message: 'Parse error at [3:0]: Unexpected \'TERMINATOR\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token] ],
     token:
      Token {
        _type: 'TERMINATOR',
        _value: '\n',
        _loc: 3,
        _len: 0,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'TERMINATOR',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'tag' } tag
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.stop' } .stop
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.prevent' } .prevent
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.silence' } .silence
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.self' } .self
error compiling undefined
error?! { [Error: Parse error at [3:1]: Unexpected '.']
  error: { message: 'Parse error at [3:1]: Unexpected \'.\'' },
  message: 'Parse error at [3:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens:
      [ [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 3,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'tag.trigger(name, data = null)' } tag.trigger(name, data = null)
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.classname' } .classname
error compiling undefined
error?! { [Error: Parse error at [4:2]: Unexpected 'FORIN']
  error: { message: 'Parse error at [4:2]: Unexpected \'FORIN\'' },
  message: 'Parse error at [4:2]: Unexpected \'FORIN\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: 'FORIN',
        _value: 'in',
        _loc: 4,
        _len: 2,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'FORIN',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'for in' } for in
error compiling undefined
error?! { [Error: Parse error at [5:0]: Unexpected 'TERMINATOR']
  error:
   { message: 'Parse error at [5:0]: Unexpected \'TERMINATOR\'' },
  message: 'Parse error at [5:0]: Unexpected \'TERMINATOR\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token] ],
     token:
      Token {
        _type: 'TERMINATOR',
        _value: '\n',
        _loc: 5,
        _len: 0,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'TERMINATOR',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'await' } await
error compiling undefined
error?! { [Error: inconsistent    indentation]
  error:
   { SyntaxError: inconsistent    indentation
       at Lexer.error (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:2176:12)
       at Lexer.lineToken (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:1480:18)
       at Lexer.basicContext (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:384:138)
       at Lexer.parse (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:375:109)
       at Lexer.tokenize (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:351:7)
       at Object.exports.tokenize.self.tokenize (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/compiler.js:29:20)
       at Object.exports.compile.self.compile (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/compiler.js:78:21)
       at Object.exports.compile.self.compile (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/index.js:25:18)
       at Renderer.renderer.code (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:190:18)
       at Parser.tok (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:999:28) line: undefined },
  message: 'inconsistent    indentation',
  filename: undefined,
  line: undefined,
  _options:
   { tokens:
      [ [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token] ],
     pos: 14 },
  region: [ 57, 57 ],
  _code:
   'var number = 1\nvar numberString = switch number\n  when 0\n\t"zero"\n   when 1\n\t"one"\n   else\n\t"not 1 nor 0"\n\n# compact \nvar numberString2 = switch number\n  when 0 then "zero"\n  when 1 then "one"\n  else "not 1 nor 0"\n\n# you can also mix them\nvar numberString3 = switchnumber\n  when 0 then "zero"\n  when 1\n\t"one"\n  else "not 1 nor 0"' } var number = 1
var numberString = switch number
  when 0
        "zero"
   when 1
        "one"
   else
        "not 1 nor 0"

# compact
var numberString2 = switch number
  when 0 then "zero"
  when 1 then "one"
  else "not 1 nor 0"

# you can also mix them
var numberString3 = switch number
  when 0 then "zero"
  when 1
        "one"
  else "not 1 nor 0"
TypeError: Cannot read property 'toString' of undefined
~/d/g/i/imba.io ❯❯❯ npm run start

> imba.io@1.0.0 start /Users/eric/dev/git/imba-org/imba.io
> imba ./src/server.imba

server is running on port 3011
error compiling undefined
error?! { [Error: Parse error at [3:0]: Unexpected 'TERMINATOR']
  error:
   { message: 'Parse error at [3:0]: Unexpected \'TERMINATOR\'' },
  message: 'Parse error at [3:0]: Unexpected \'TERMINATOR\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token] ],
     token:
      Token {
        _type: 'TERMINATOR',
        _value: '\n',
        _loc: 3,
        _len: 0,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'TERMINATOR',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'tag' } tag
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.stop' } .stop
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.prevent' } .prevent
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.silence' } .silence
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.self' } .self
error compiling undefined
error?! { [Error: Parse error at [3:1]: Unexpected '.']
  error: { message: 'Parse error at [3:1]: Unexpected \'.\'' },
  message: 'Parse error at [3:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens:
      [ [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 3,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'tag.trigger(name, data = null)' } tag.trigger(name, data = null)
error compiling undefined
error?! { [Error: Parse error at [0:1]: Unexpected '.']
  error: { message: 'Parse error at [0:1]: Unexpected \'.\'' },
  message: 'Parse error at [0:1]: Unexpected \'.\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 1,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: '.',
        _value: '.',
        _loc: 0,
        _len: 1,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: '.',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: '.classname' } .classname
error compiling undefined
error?! { [Error: Parse error at [4:2]: Unexpected 'FORIN']
  error: { message: 'Parse error at [4:2]: Unexpected \'FORIN\'' },
  message: 'Parse error at [4:2]: Unexpected \'FORIN\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token], [Token] ],
     token:
      Token {
        _type: 'FORIN',
        _value: 'in',
        _loc: 4,
        _len: 2,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'FORIN',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'for in' } for in
error compiling undefined
error?! { [Error: Parse error at [5:0]: Unexpected 'TERMINATOR']
  error:
   { message: 'Parse error at [5:0]: Unexpected \'TERMINATOR\'' },
  message: 'Parse error at [5:0]: Unexpected \'TERMINATOR\'',
  filename: undefined,
  line: undefined,
  _options:
   { pos: 2,
     tokens: [ [Token], [Token] ],
     token:
      Token {
        _type: 'TERMINATOR',
        _value: '\n',
        _loc: 5,
        _len: 0,
        _meta: null,
        generated: false,
        newLine: false,
        spaced: false,
        call: false },
     meta:
      { lexer: [Object],
        text: undefined,
        token: 'TERMINATOR',
        line: undefined,
        expected: [],
        recoverable: false } },
  _code: 'await' } await
error compiling undefined
error?! { [Error: inconsistent    indentation]
  error:
   { SyntaxError: inconsistent    indentation
       at Lexer.error (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:2176:12)
       at Lexer.lineToken (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:1480:18)
       at Lexer.basicContext (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:384:138)
       at Lexer.parse (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:375:109)
       at Lexer.tokenize (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/lexer.js:351:7)
       at Object.exports.tokenize.self.tokenize (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/compiler.js:29:20)
       at Object.exports.compile.self.compile (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/compiler.js:78:21)
       at Object.exports.compile.self.compile (/Users/eric/dev/git/imba-org/imba.io/node_modules/imba/lib/compiler/index.js:25:18)
       at Renderer.renderer.code (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:190:18)
       at Parser.tok (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:999:28) line: undefined },
  message: 'inconsistent    indentation',
  filename: undefined,
  line: undefined,
  _options:
   { tokens:
      [ [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token],
        [Token] ],
     pos: 14 },
  region: [ 57, 57 ],
  _code:
   'var number = 1\nvar numberString = switch number\n  when 0\n\t"zero"\n   when 1\n\t"one"\n   else\n\t"not 1 nor 0"\n\n# compact \nvar numberString2 = switch number\n  when 0 then "zero"\n  when 1 then "one"\n  else "not 1 nor 0"\n\n# you can also mix them\nvar numberString3 = switchnumber\n  when 0 then "zero"\n  when 1\n\t"one"\n  else "not 1 nor 0"' } var number = 1
var numberString = switch number
  when 0
        "zero"
   when 1
        "one"
   else
        "not 1 nor 0"

# compact
var numberString2 = switch number
  when 0 then "zero"
  when 1 then "one"
  else "not 1 nor 0"

# you can also mix them
var numberString3 = switch number
  when 0 then "zero"
  when 1
        "one"
  else "not 1 nor 0"
TypeError: Cannot read property 'toString' of undefined
    at Renderer.renderer.code (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:219:22)
    at Parser.tok (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:999:28)
    at Parser.parse (/Users/eric/dev/git/imba-org/imba.io/node_modules/marked/lib/marked.js:944:17)
    at Object.exports.render.self.render (/Users/eric/dev/git/imba-org/imba.io/src/util/markdown.imba:298:23)
    at add (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:33:18)
    at add (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:27:5)
    at new Guide (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:63:2)
    at Function.Guide.get (/Users/eric/dev/git/imba-org/imba.io/src/data/guide.imba:70:33)
    at /Users/eric/dev/git/imba-org/imba.io/src/server.imba:32:20
    at Layer.handle [as handle_request] (/Users/eric/dev/git/imba-org/imba.io/node_modules/express/lib/router/layer.js:95:5)

```
