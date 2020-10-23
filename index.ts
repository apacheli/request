import http from 'http';
import https, { RequestOptions as HTTPSRequestOptions } from 'https';
import zlib from 'zlib';

export interface RequestOptions extends HTTPSRequestOptions {
  body?: Buffer,
  timeout?: number
}

const request = (address: string, options: RequestOptions = {}) => {
  const url = new URL(address);
  const r = (url.protocol === 'https:' ? https : http).request;

  const cr = r(url, options);
  if (options.body) {
    cr.write(options.body);
  }
  if (options.timeout) {
    cr.setTimeout(options.timeout);
  }
  cr.end();

  return new Promise((resolve, reject) => {
    cr
      .once('error', reject)
      .on('response', (response) => {
        const chunks: Buffer[] = [];

        let stream;
        switch (response.headers['content-encoding']) {

          case 'deflate': {
            stream = response.pipe(zlib.createInflate());
            break;
          }

          case 'gzip': {
            stream = response.pipe(zlib.createGunzip());
            break;
          }

          default: {
            stream = response;
            break;
          }
        }

        stream
          .on('data', (chunk) => chunks.push(chunk))
          .once('end', () => {
            if (response.complete) {
              resolve({ body: chunks, request: cr, response });
              return;
            }
            reject(new Error('Incomplete request.'));
          })
          .once('error', reject);
      })
      .once('timeout', () => cr.destroy(new Error('Request timed out.')));
  });
};

export default request;
