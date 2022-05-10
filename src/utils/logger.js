const prefix = '[Draft3D] - ';
const log = (msg, level = 'log') => {
  console[level](prefix + msg);
}

const logger = {
  log,
  warn: (msg) => log(msg, 'warn'),
  error: (msg) => log(msg, 'error'),
}

export default logger;