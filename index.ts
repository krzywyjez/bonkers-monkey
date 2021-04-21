import * as pino from 'pino';

function patchConsoleLog(logger: pino.Logger, console: Console): void {
  console.debug = (...args) => {
    for (const arg of args) {
      logger.debug(arg);
    }
  };

  console.info = (...args) => {
    for (const arg of args) {
      logger.info(arg);
    }
  };

  console.warn = (...args) => {
    for (const arg of args) {
      logger.warn(arg);
    }
  };

  console.error = (...args) => {
    for (const arg of args) {
      logger.error(arg);
    }
  };

  console.log = (...args) => {
    const isKryptoError = args.some((arg) => arg && typeof arg === 'string' && arg.startsWith('Error'));

    for (const arg of args) {
      if (isKryptoError) {
        logger.error(arg);
      } else {
        logger.info(arg);
      }
    }
  };
}

// NOTE: Stolen from https://github.com/pinojs/pino-caller
const { asJsonSym } = pino.symbols;
const CONSOLE_LOG_MONKEY_PATCH_OFFSET = 1;
const NODEJS_VERSION = parseInt(process.version.slice(1).split('.')[0], 10);
const STACKTRACE_OFFSET = (NODEJS_VERSION && NODEJS_VERSION > 6 ? 0 : 1) + CONSOLE_LOG_MONKEY_PATCH_OFFSET;
const LINE_OFFSET = 7;

function traceCaller(pinoInstance, options = { relativeTo: null }) {
  function get(target, name) {
    return name === asJsonSym ? asJson : target[name];
  }

  function asJson(...args) {
    args[0] = args[0] || Object.create(null);
    args[0].caller = Error()
      .stack.split('\n')
      .slice(2)
      .filter((s) => !s.includes('node_modules/pino') && !s.includes('node_modules\\pino'))
      [STACKTRACE_OFFSET].substr(LINE_OFFSET);
    if (options && typeof options.relativeTo === 'string') {
      args[0].caller = args[0].caller.replace(options.relativeTo + '/', '').replace(options.relativeTo + '\\', '');
    }
    return pinoInstance[asJsonSym].apply(this, args);
  }

  return new Proxy(pinoInstance, { get });
}
// NOTE: end of steal

export function patchConsole(console: Console = global.console) {
  const logger = pino({
    prettyPrint: {
      colorize: true,
      translateTime: true,
      ignore: 'pid,hostname',
    },
  });

  const loggerWithCallee = traceCaller(logger, { relativeTo: process.cwd() });

  patchConsoleLog(loggerWithCallee, console);
}
