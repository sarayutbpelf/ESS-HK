const crypto = require('crypto');

function verifyHmac(body, signatureHeader, secret) {
  if (!secret) return false;
  try {
    const [algo, provided] = signatureHeader.split('=');
    if (algo !== 'sha256') return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(provided, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch { return false; }
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x1F\x7F<>'"]/g, '').trim().slice(0, 200);
}

module.exports = { verifyHmac, sanitizeString };
