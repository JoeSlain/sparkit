import { renderToReadableStream } from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';

/** Build-time SPA shell only. Deployment serves build/client without a Node server. */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  if (request.method === 'HEAD')
    return new Response(null, { status: responseStatusCode, headers: responseHeaders });
  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError() {
        responseStatusCode = 500;
      },
    },
  );
  await body.allReady;
  responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(body, { status: responseStatusCode, headers: responseHeaders });
}
