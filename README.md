# bonkers-monkey
Bonkers monkey patch for console log using [pino](https://github.com/pinojs/pino) logger :monkey_face:

## Why

To improve visibility of logs in application which uses `console.log` for logging

## Usage

Install package

```
npm i bonkers-monkey
```

Invoke console patching in code

```
import { patchConsole } from 'bonkers-monkey';

patchConsole();
```

![bonkers-log](https://github.com//krzywyjez/bonkers-monkey/raw/main/img/bonkers-log.png)

### Typescript

If you use typescript then [Source Map Support](https://www.npmjs.com/package/source-map-support) package can be used to resolve line numbers in typescript files

```
node -r source-map-support/register index.js
```

