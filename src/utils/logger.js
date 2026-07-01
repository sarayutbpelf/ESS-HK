function log(level, message, meta = {}) {
  const entry = { ts: new Date().toISOString(), level, message, ...meta };
  delete entry.name; delete entry.hn; delete entry.pid;
  delete entry.address; delete entry.phone; delete entry.email;
  process.stdout.write(JSON.stringify(entry) + '\n');
}

module.exports = {
  info:  (msg, meta) => log('INFO',  msg, meta),
  warn:  (msg, meta) => log('WARN',  msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta),
};
