import http, { ClientRequest, IncomingMessage } from 'http';
import https, { RequestOptions as HTTPSRequestOptions } from 'https';
import zlib, { Gunzip, Inflate } from 'zlib';

interface RequestOptions extends HTTPSRequestOptions {
  body?: Buffer
}

interface RequestResult {
  body: Buffer[],
  request: ClientRequest,
  response: IncomingMessage
}

const request = (address: string, options?: RequestOptions) => {
  const url = new URL(address);
  const r = (url.protocol === 'https:' ? https : http).request;

  // @ts-ignore: tfw http/https request function overloads suck
  const cr = r(url, options);
  if (options?.body) {
    cr.write(options.body);
  }
  if (options?.timeout) {
    cr.setTimeout(options.timeout);
  }
  cr.end();

  return new Promise<RequestResult>((resolve, reject) => {
    cr
      .once('error', reject)
      .on('response', (response) => {
        const chunks: Buffer[] = [];

        let stream: IncomingMessage | Inflate | Gunzip = response;
        switch (response.headers['content-encoding']) {

          case 'deflate': {
            stream = response.pipe(zlib.createInflate());
            break;
          }

          case 'gzip': {
            stream = response.pipe(zlib.createGunzip());
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
