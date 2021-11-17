# Introduction

## Build Fast, Fast.

Imba is a Web programming language that compiles to Javascript. Imba is fast in two ways: Time-saving syntax with built-in tags and styles results in less typing and switching files so you can build things fast. A groundbreaking memoized DOM is an order of magnitude faster than virtual DOM libraries, so you can build fast things.

In Imba DOM elements _and_ CSS are treated as first-class citizens. DOM elements are compiled to a [memoized DOM](https://www.freecodecamp.org/news/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52/), which is an [order of magnitude faster](https://somebee.github.io/dom-reconciler-bench/index.html) than today's virtual DOM implementations.

#### Imba At A Glance
- Compiles to Javascript
- Works with Javascript
- Smart, Minimal Syntax
- Built-in Tags & Styles
- Amazing Performance

## Community

#### Discord Server

For questions and support please use our community chat on
[Discord](https://discord.gg/mkcbkRw) or our [discourse](https://users.imba.io/).

#### Community Meeting

Everyone is welcome! This is a great place to report your issues, hangout and talk about your project using Imba. If you have an open pull request which has not seen attention, you can mention it during the meeting.

For the exact meeting times please use the Meetup group [Imba Oslo Meetup](https://www.meetup.com/Imba-Oslo-Meetup), this is where you can see the timezone, cancellations, etc.

You can join us remotely via [Zoom](https://us04web.zoom.us/j/230170873).

Did you miss a meeting? No worries, catch up via the [meeting notes](https://docs.google.com/document/d/1ABGjOJut9eXrajYjdN4G4-UGGU4gvKznLk5CAaXYjso/edit?usp=sharing) or [video recordings](https://www.youtube.com/playlist?list=PLf1a9PYKGPdl3OMBHV72Oz23eFy9q51jJ).


## Getting Started

### Quickstart

The best way to get started with Imba is to use `npx` to get a brand-new project up and running.

```sh
npx imba create my-app
```

Follow the instructions to complete the fresh install.

### Full example

```sh
npx imba create my-app
cd my-app
npm install
npm start
```

This will create a brand new app using the latest version of Imba and run it with hot reloading. Edit the `/app/client.imba` file to get started.

To create a build version of the app for deployment, simply run:

```sh
npm build
```

### Useful tools

We thoroughly recommend using our Visual Studio Code integration which has fantastic tooling when using Imba - including autocomplete for css shortcuts.

- [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=scrimba.vsimba)

### Getting help

If you run into any issues, you can check out the GitHub repository or come and join us in our friendly Discord chat group.

- [GitHub](https://github.com/imba/imba)
- [Discord](https://discord.gg/mkcbkRw)