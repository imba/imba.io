# Deploying Your App

## Deploying Imba as a static site

_These instructions assume you are using our [imba-vite-template](https://github.com/imba/imba-vite-template). Not all static site hosts are ready for Node v18, **we recommend Node v16 for static sites**._

Imba transpiles to JavaScript, HTML and CSS. Using Vite as its bundler means you can follow [Vite's deploy instructions](https://vitejs.dev/guide/static-deploy.html).

For example, you can deploy it to these (and more!) static site hosts:

- [Deploy Vite sites to Netlify](https://vitejs.dev/guide/static-deploy.html#netlify).
- [Deploy Vite sites to GitHub Pages](https://vitejs.dev/guide/static-deploy.html#github-pages).
- [Deploy Vite sites to CloudFlare Pages](https://vitejs.dev/guide/static-deploy.html#cloudflare-pages).
- [Deploy Vite sites to Vercel](https://vitejs.dev/guide/static-deploy.html#vercel).

## Deploying Imba to run on your server

_These instructions assume you are using our [imba-base-template](https://github.com/imba/imba-base-template). **We recommend Node v18 for full stack Imba.**_

You can think of deploying full stack Imba applications just like an [Express](https://expressjs.com/) application. Anything imported in the `server.imba` entrypoint will be included on the server. See the [production guide](run-in-production) for a more in-depth guide for running Imba on your server in production.
