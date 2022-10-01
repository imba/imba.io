# Incremental Adoption & Reusable Components

Since Imba compiles to readable JavaScript, including arbitrary
Imba code in your existing project is very easy. Moreover, since
Imba components are actual custom elements, you can use them with
both plain HTML projects and most JavaScript UI framework
projects (React, Vue, Svelte, etc.)

Using components from imported Imba files is as simple as
appending their names with `-tag`. You don't need to export the
tags. For example, if you import an Imba file that has *only* the
following contents:

```imba
tag marshmellow
  <self> "yo!"
```

In React, Vue, and Svelte you can use the component this way:

```js
<marshmellow-tag/>
```

See the following sections for how to import Imba files depending on your configuration.

## With Vite

The best way to include Imba files in your existing non-Imba
project is with [Vite](https://vitejs.dev/). If your existing
project doesn't use Vite, try [#with-modules](#with-modules) or
[#with-npm](#with-npm) instead.

- Add `imba` and `vite-plugin-imba` to your existing project:
	```bash
	npm i -D imba vite-plugin-imba
	```

- In `vite.config.js` import the Imba plugin:

	```js
	import { imba } from 'vite-plugin-imba'
	```

- And add `imba()` to the list of plugins:

	```js
		plugins: [vue(),imba()],
	```

- In your app you can now import any Imba files with:

	```js
	import './filename.imba'
	```

## With Modules

If you use eslint, this option may not work without disabling
some rules; try [#with-npm](#with-npm) instead.

- In your non-Imba project, run:

	```bash
	npx imba create --template component imba-project
	cd imba-project
	npm run build
	```

- Import the Imba project into your non-Imba project as a module via:

	```js
	import './imba-project'
	```

## With NPM

- Anywhere on your computer, run:

	```bash
	npx imba create --template component imba-project
	cd imba-project
	npm run build
	npm link
	```

	`npm link` will expose your Imba project as a package to the
	rest of your computer.

- In your non-Imba project, run:

	```bash
	npm link imba-project
	```

- In your non-Imba project, import the Imba package with

	```js
	import 'imba-project'
	```

Keep in mind `npm link` uses the `"name"` field from the
`package.json` file in your Imba project, not the folder name.

It's also worth noting that this method will link the Imba
package to your non-Imba project's `node_modules` folder, but it
will not reflect that in your non-Imba project's `package.json`
file. If you want to share your project, you might consider
publishing the Imba package on npm and using `npm install`
instead of `link`.

Read more about `npm link`
[here](https://docs.npmjs.com/cli/v8/commands/npm-link).

## With Script Tags

- In your non-Imba project, run:

	```bash
	npx imba create --template component imba-project
	cd imba-project
	npm run build
	```

- In your non-Imba project's `index.html` file, source the
Imba project's bundle with a script tag:

	```html
	<script src="imba-project/dist/index.js"></script>
	```
