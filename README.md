# 👝 @fxjs/handbag

[![NPM version](https://img.shields.io/npm/v/@fxjs/handbag.svg)](https://www.npmjs.org/package/@fxjs/handbag)
[![Build Status](https://travis-ci.org/fxjs-modules/handbag.svg)](https://travis-ci.org/fxjs-modules/handbag)
[![Build status](https://ci.appveyor.com/api/projects/status/4qsyfynj1t0559pl?svg=true)](https://ci.appveyor.com/project/richardo2016/handbag)

## Pre-requisite

- `fibjs >= 0.26.0`

## Usage

`npm install @fxjs/handbag`

### Sample

register one compiler for `.pug` file

```javascript
const fxHandbag = require('@fxjs/handbag')

const fpug = require('fib-pug')
function registerPugAsHtml (vbox) {
    const compilerOptions = {
        filters: {
            typescript: require('jstransformer-typescript').render,
            stylus: require('jstransformer-stylus').render,
        }
    }

    fxHandbag.vboxUtils.setCompilerForVbox(vbox, {
        suffix: '.pug',
        compiler: (buf, info) => fxHandbag.vboxUtils.wrapAsString(
            fpug.renderFile(info.filename, compilerOptions)
        )
    })
}

const vm = require('vm')

vbox = new vm.SandBox(moduleHash)
registerPugAsHtml(vbox)

// just require one pug as rendered html string
const renderedHtml = vbox.require('./test.pug', __dirname)
```

you can also do like this:

```javascript
const compilerOptions = {
    filters: {
        typescript: require('jstransformer-typescript').render,
        stylus: require('jstransformer-stylus').render,
    }
}

const vbox = new vm.SandBox(moduleHash)
fxHandbag.registers.pug.registerPugAsHtml(vbox, { compilerOptions })

const renderedHtml = vbox.require('./test.pug', __dirname)
```

## APIs

### vboxUtils

`vboxUtils` is some basic operation for one vbox generated by `new vm.SandBox(...)`

`setCompilerForVbox(vbox: Class_SandBox, options: SetCompilerForVBoxOptions)`
---

set one `compiler` function for `vbox`, the `compiler` is used for [`vbox.setModuleCompiler`].

```typescript
interface SetVboxOptions {
    suffix: string|string[],
    compiler: Function,
    compile_to_iife_script?: boolean
}
```

### registers

#### Common Option

register functions support options below:

```javascript
{
    // compilerOptions passed to render of register.
    compilerOptions: {...},
    // timeout that module keep required file id,
	// - if it is 0, keep module always
	// - if it is lower than 0, it would NIRVANA after remove it, that means module required would be updated after burnout_timeout.
    burnout_timeout: {...}
}
```

`plain.registerAsPlain(vbox, options)`
---
- options.suffix: default `['.txt']`

register compiler to require file as its plain text

`pug.registerPugAsRender(vbox, options)`
---
- options.suffix: default `['.pug', '.jade']`

register compiler to require pug file as pug renderer

`pug.registerPugAsHtml(vbox, options)`
---
- options.suffix: default `['.pug', '.jade']`

register compiler to require pug file as rendered html




`stylus.registerStylusAsCss(vbox, options)`
---
- options.suffix: default `['.styl', '.stylus']`

register compiler to require stylus file as rendered html




`typescript.registerTypescriptAsModule(vbox, options)`
---
- options.suffix: default `['.ts']`

register compiler to require typescript file as one valid module

`typescript.registerTypescriptAsPlainJavascript(vbox, options)`
---
- options.suffix: default `['.ts']`

register compiler to require typescript file as plain javascript string.




`rollup.registerAsModule(vbox, options)`
---
- options.suffix: default `['.ts', '.tsx']`
- options.rollup

register compiler to require typescript file as module.

**extra dependencies**
- [fib-rollup]
- [rollup-plugin-commonjs]


`rollup.registerAsPlainJavascript(vbox, options)`
---
- options.suffix: default `['.ts', '.tsx']`
- options.rollup

register compiler to require typescript file as **rolluped** plain javascript string.

**extra dependencies**
- [fib-rollup]
- [rollup-plugin-commonjs]


`vue.registerVueAsRollupedJavascript(vbox, options)`
---
- options.suffix: default `['.vue']`
- options.rollup
- options.rollupPluginVueOptions: default `{}`, options passwd to [rollup-plugin-vue]
- options.transpileLib: default `'babel'`
    - any value equals to `false`: no transpile
    - 'babel': transpile component with babel
    - 'buble': transpile component with buble

register compiler to require typescript file as **rolluped** plain javascript string

**NOTICE** it's not recommend use `async/await` in vue component, if you do so, the transpiled vue component's size would be large.

it would compile vue component js to 'es5' by default. If `<script lang="ts">` set,
it always transpile component js with typescript

**extra dependencies**
- [fib-rollup]
- [rollup-plugin-commonjs]
- [rollup-plugin-vue]

- [rollup-plugin-buble] (if use options.transpileLib="buble")
- [rollup-plugin-typescript] (if use lang="ts")
     - `tslib`
     - `typescript`


`riot.registerRiotAsJs(vbox, options)`
---
**started from `0.2.3`**

- options.suffix: default `['.tag', '.tsx']`
- options.compress_js: default `true`

register compiler to require `.tag` file as **compiled** javascript string starting with `riot.tag2(...)`.




`image.registerImageAsBase64(vbox, options)`
---
- options.suffix: default `['.png', '.jpg', '.jpeg', '.gif', '.bmp']`

register compiler to require image file as base64 string




`graphql.registerGraphQLParser(vbox, options)`
---
**started from `0.2.4`**

- options.suffix: default `['.gql', '.graphql']`

register compiler to require graphql file as parsed [graphql-js] object.

**extra dependencies**
- [graphql]
- [graphql-tag]




`graphql.registerGraphQLAsQueryBuilder(vbox, options)`
---
**started from `0.2.4`**

- options.suffix: default `['.gql', '.graphql']`

register compiler to require graphql file as string builder, it's just simple text replacor.

```javascript
// index.js
graphql.registerGraphQLAsQueryBuilder(vbox)

vbox.require('./foo.gql')({foo: 'bar'}) // result is { q1(foo: 'bar'){} }

// foo.gql
{ q1(foo: $foo){} }
```


## common options

### `registerOptions.compilerOptions`

options passed to register's compiler/transpilor/renderer, view details in specified register

### `registerOptions.hooks`

there's one `emitter` option with `EventEmitter` type in `registerOptions`, all `key` in `registerOptions.hooks` would be registered as emitter's event_name with handler from `registerOptions.hooks[key]`, e.g:

```javascript
{
	...
	hooks: {
		before_transpile: (payload) => {
			// print required file's information
			console.log(payload.info)
		},
		generated: (payload) => {
			// change content from every file required by this Sandbox to 'always online'
			payload.result = 'always online'
		}
	}
	...
}
```

**supported hooks**
- `before_transpile`
	- `payload.raw`: original content's buffer
	- `payload.info`: file information
- `generated`: payload: {result}
	- `payload.result`: transpiled content

### `registerOptions.rollup`
There's register based on rollup, its registerOptions has those options:

- options.rollup.bundleConfig: default `{}`, config passed to
    - `const bundle = rollup.rollup({...})`
- options.rollup.writeConfig: default `{}`, config passed to
    - `bundle.write({...})`
    - `bundle.generate({...})`
- options.rollup.onGenerateUmdName: default `(buf, info) => 's'`. generate name for rollup's `umd`/`iife` mode

### `registerOptions.burnout_timeout`

In some cases, we want vbox to remove required module by ID after `burnout_timeout`.

For example, you are developing one website's user profile page, which rendered from `path/user-profile.pug`, you serve it with `http.Server` and `mq.Routing`, and require the pug file as `require('path/user-profile.pug', __dirname)` with special vbox generated by registers in `@fxjs/handbag` or by your own manual registering. You change the pug file, then you wish the next calling to `require('path/user-profile.pug', __dirname)` would return the latest file resource. So, you need remove the required content every other times(such as 300ms), which is `burnout_timeout`.

All reigsters's option in `@fxjs/handbag` supports `burnout_timeout` option.

#### NOTICE

**nirvana**

if `burnout_timeout` set as Integer lower than 0, after one module(with moduleId `mid`) removed from Sandbox(that would happend after `burnout_timeout`), it would be require right away. e.g.

non-nirvana mode:
- : user: `burnout_timeout = 200`
- : user: `sandbox.require(mid)`
- : ---> `burnout_timeout` gone...
- : `sandbox.remove(mid)`
- : user: `sandbox.require(mid)`

nirvana mode:
- : user: `burnout_timeout = -200`
- : user: `sandbox.require(mid)`
- : ---> `burnout_timeout` gone...
- : `sandbox.remove(mid)` **and** `sandbox.require(mid)`

**20ms**

In general, there's time-range about lower than `20ms`(it's tested) when you require one file **as plain** via registered box in `@fxjs/handbag`, but it would over `20ms` in these cases:

- when content of file to require is **too big**
- transpilation in register would spend too much time.

If you develop app based on this feature(`burnout_time`), notice the time-range

## License

[GPL-3.0](https://opensource.org/licenses/GPL-3.0)

Copyright (c) 2018-present, Richard

[`vbox.setModuleCompiler`]:http://fibjs.org/docs/manual/object/ifs/sandbox.md.html#setModuleCompiler

[fib-rollup]:https://www.npmjs.com/package/fib-rollup
[rollup-plugin-buble]:https://www.npmjs.com/package/rollup-plugin-buble
[rollup-plugin-commonjs]:https://www.npmjs.com/package/rollup-plugin-commonjs
[rollup-plugin-vue]:https://www.npmjs.com/package/rollup-plugin-vue
[rollup-plugin-typescript]:https://www.npmjs.com/package/rollup-plugin-typescript
[graphql-js]:https://github.com/graphql/graphql-js
[graphql]:https://github.com/graphql/graphql-js
[graphql-tag]:https://github.com/apollographql/graphql-tag