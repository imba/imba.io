---
title: Introduction
---

# What is Imba?

Imba is a new programming language for the web that compiles
to performant JavaScript. It is heavily inspired by ruby and python, but developed explicitly for web programming (both server and client). It has language level 
support for defining, extending, subclassing, instantiating 
and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than [10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html)
with less code, and a much smaller library.

```imba
var number = 42
var opposite = true
var string = "the answer is {number}"
var regex = /answer is (\d+)/

var info =
    name: 'Imba'
    version: Imba.VERSION
    repository: 'https://github.com/somebee/imba'
    inspiration: ['ruby','python','react','coffeescript']
    creator: 'Sindre Aarsaether'
    contributors: [
        'Sindre Aarsaether' # github.com/somebee
        'Magnus Holm' # github.com/judofyr
        'Slee Woo' # github.com/sleewoo
    ]
```

All snippets of code in the documentation are editable inline,
with highlighting and annotations. It is implemented in [scrimbla](http://github.com/somebee/scrimbla) - an experimental web based editor for imba, written in imba. Don't expect it to work perfectly just yet, but have fun.

The Imba compiler is itself written in Imba, using a custom version of the
Jison parser generator. The command-line version of imba is available as a
node.js utility. The compiler itself does not depend on Node, and can be
run in any JavaScript environment, or in the browser.

> Some people might be confused by the comparison to React. React is a framework, Imba is a language - are these two comparable? [see discussion](https://news.ycombinator.com/item?id=10094371)

# Installation

Get [node](http://nodejs.org) and [npm](http://npmjs.org), then install imba
via npm. If your npm installation is global, you might need to use sudo.

    > npm install -g imba

The imba npm package includes the compiler *and* the runtime. When you want
to use tags and other advanced parts of Imba, you must include the imba runtime
as well. To do this, make sure that you have the imba package installed locally
in your project as well. So, in the root directory of your project, type: 

    > npm install imba --save

This will install imba as a dependency, and add it to your package.json if
you have one set up. Then, make sure to `require 'imba'`, usually
the entry point of your application.

## Usage

### CLI

Once you have installed Imba (globally), you should have access to the imba executable in your terminal. You can use this to run, compile, and analyze your imba-files. 

`> imba sample.imba` will run the file sample.imba

`> imba compile src/` will compile all imba files inside src (recursively). By default, Imba will look for a matching lib/ directory, and save the resulting files there. If no such directory exists, it will save the resulting js files in the same directories as their corresponding imba files.

`> imba watch src/` will compile like above, but watch for changes as well, and recompile when needed. It takes all the same options as imba compile.

> Tip! When compiling files and folders without specifying an output location Imba will follow a specific convention. If the path includes a src/ directory, and there is a sibling lib/ directory, Imba will automatically choose this path. If you have the directories `/myapp/src` and `/myapp/lib`, running `> imba compile /myapp/src/app.imba` will by default write the compiled code to `/myapp/lib/app.js`.

### Webpack

For real projects, you might not want to keep the compiled code in the repository. The recommended way to use Imba in the browser is to compile your project with webpack. With webpack it is trivial to continually build your project, with source-mapping++ in development, and minification++ in production. Check out [imba-loader](https://github.com/judofyr/imba-loader) for more information.

### Browserify

Since Imba compiles to plain old javascript, you can use browserify as well. Until there is a plugin for browserify you will need to compile/watch the imba files/directories using the CLI and use browserify on the compiled code.

## Plugins

Support for Atom and other editors is on the roadmap, but currently Sublime Text 3 is the only official editor/ide for Imba.

### [Sublime Text](https://packagecontrol.io/packages/Imba)

The plugin can be installed through [Package Control](https://packagecontrol.io) (it's called Imba). Or you can install it manually by cloning the
[sublime-imba](https://github.com/somebee/sublime-imba) repository into your Sublime Text Packages/ folder.

> We recommend using the very [latest version](http://www.sublimetext.com/3dev) of Sublime Text (dev channel) to get the best syntax highlighting and annotations.
 
### [Scrimbla](https://github.com/somebee/scrimbla)

Scrimbla is an experimental web based editor for Imba, written in Imba. It is still *very* rough around the edges, but it is used for all examples on imba.io, and a local version for editing files/projects is underway. The code for this editor can be found at [somebee/scrimbla](http://github.com/somebee/scrimbla).

> While Scrimbla is currently only usable for simple snippets, the long term goal is to make it the preferred environment for coding imba. We're looking for contributors!


### [Atom](https://atom.io/packages/language-imba)

There is an [unofficial Atom plugin](https://atom.io/packages/language-imba) that is based on the sublime text plugin. This does not have integrated highlighting of scoped variables etc, but it should work for basic highlighting.

### [Vim](https://github.com/simeng/vim-imba)

Unofficial plugin or vim, Vimba, can be found at [simeng/vim-imba](https://github.com/simeng/vim-imba). It is very much under development.

# Examples

Since Imba is a new language, there aren't that many open-source examples out in the wild. It is being used in several 100kloc+ commercial projects, so it should definitely be production-ready.

### Hello World

If you want to get started with Imba right away, it is recommended to download our starter pack and get it running.

### Imba.io

This whole website is written in Imba. It uses the same code for server and clent. After the initial load, all navigation in the browser is happening with history push/popState, and rendered directly on the client, yet any hard refresh should land you at the same spot when rendered from the server, thanks to using the same logic for routing as well. Grab it over at [github](https://github.com/somebee/imba.io)

### Scrimbla

The inline editor used throughout this site is written in Imba, and available at [github](https://github.com/somebee/scrimbla). It is a decent example of a project.

Next up, read about [the language](/guides/language) itself!
