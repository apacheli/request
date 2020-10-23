# @apacheli/request
Promise-based request module. It's pretty cool.

```ts
import request from '@apacheli/request';

const { chunks } = await request('https://hastebin.com/documents', {
  method: 'POST',
  body: Buffer.from('Hello, World!')
});

const body = Buffer.concat(chunks);
const json = JSON.parse(body);
console.log(`https://hastebin.com/${json.key}`);
```
