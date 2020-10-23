# @apacheli/request
Promise-based request module. It's pretty cool.

```ts
import request from '@apacheli/request';

const { body } = await request('https://hastebin.com/documents', {
  method: 'POST',
  body: Buffer.from('Hello, World!')
});

const json = JSON.parse(body.join(''));
console.log(`https://hastebin.com/${json.key}`);
```
