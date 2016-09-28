## FCeptor

An interceptor of [Fetch API](https://fetch.spec.whatwg.org/).

## Install

```bash
npm install fceptor
```

## Usage

```javascript
FCeptor.when(method, route, requestHandler, responseHandler);
```

| name            | type             | meaning               |
| --------------- | ---------------- | --------------------- |
| method          | RegExp or String | HTTP Method Matcher   |
| route           | RegExp or String | Request Path Matcher  |
| requestHandler  | Function         | Request Hook Handler  |
| responseHandler | Function         | Response Hook Handler |

In addition, some shortcut methods are provided:

```javascript
FCeptor.get(...args);
FCeptor.post(...args);
FCeptor.put(...args);
FCeptor.delete(...args);
FCeptor.patch(...args);
```

## Schematic Diagram

<img src="FCeptor.png" width="613" height="308" />

## Demo

### 1. Mock a resource

```html
<script src="/node_modules/fceptor/fceptor.js"></script>
<script>
FCeptor.get(new RegExp('/hello$'), ctx => {
  ctx.response = new Response('Hello FCeptor');
  return false;
});

fetch('/hello').then(response => {
  return response.text();
}).then(result => {
  result === 'Hello FCeptor';
});
</script>
```

### 2. Go to login on 401

```html
<script src="/node_modules/fceptor/fceptor.js"></script>
<script>
FCeptor.when(/^/, new RegExp('^/login$'), null, ctx => { 
  if(ctx.response.status !== 401) return;
  location.href = '/login';
});
</script>
```
