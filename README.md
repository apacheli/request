# @apacheli/request
Promise-based request module. It's pretty cool.

```ts
import { request } from '@apacheli/request';

const { body } = await request('https://hastebin.com/documents', {
  method: 'POST',
  body: Buffer.from('Hello, World!')
});

const json = JSON.parse(body);
console.log(`https://hastebin.com/${json.key}`);
```

```ts
import { multipart, request } from '@apacheli/request';
import fs from 'fs/promises';

const fields = [
  {
    name: 'picture',
    value: await fs.readFile('./picture.png'),
    filename: 'file.png'
  },
  {
    name: 'payload_json',
    value: JSON.stringify({ content: 'Hello, World!' })
  }
];

const { boundary, chunks } = multipart(fields);

request('https://discord.com/api/v8/channels/761420467402702879/messages', {
  headers: {
    'Content-Type': `multipart/form-data; boundary="${boundary}"`,
    Authorization: 'Bot <TOKEN>'
  },
  body: chunks,
  method: 'POST'
});
```
