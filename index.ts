import http, { ClientRequest, IncomingMessage } from 'http';
import https, { RequestOptions as HTTPSRequestOptions } from 'https';
import zlib from 'zlib';

export interface RequestOptions extends HTTPSRequestOptions {
  body?: string | Buffer
}

export interface RequestResult {
  body: Buffer,
  request: ClientRequest,
  response: IncomingMessage
}

/**
 * Make a request
 * @arg address Address
 * @arg options Request options
 */
const request = (address: string, options: RequestOptions = {}) => {
  const url = new URL(address);
  const r = (url.protocol === 'http:' ? http : https).request;

  const cr = r(url, options);
  if (options.body) {
    cr.write(options.body);
  }
  if (options.timeout) {
    cr.setTimeout(options.timeout);
  }
  cr.end();

  return new Promise<RequestResult>((resolve, reject) => {
    cr
      .once('error', reject)
      .on('response', (response) => {
        const chunks: Buffer[] = [];

        let destination;
        switch (response.headers['content-encoding']) {

          case 'deflate': {
            destination = zlib.createInflate;
            break;
          }

          case 'gzip': {
            destination = zlib.createGunzip;
            break;
          }
        }

        (destination ? response.pipe(destination()) : response)
          .on('data', (chunk) => chunks.push(chunk))
          .once('end', () => {
            if (response.complete) {
              resolve({ body: Buffer.concat(chunks), request: cr, response });
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
