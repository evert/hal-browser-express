import { Application } from '@curveball/core';
import { Request, RequestHandler, Response } from 'express-serve-static-core';
import { default as halBrowser, Options, supportedContentTypes } from 'hal-browser';

export default function(options: Options): RequestHandler {

  const browser = halBrowser(options);
  const curveball = new Application();
  curveball.use(browser);

  return (req, res, next) => {

    if (req.path.startsWith('/_hal-browser/')) {
      handleAssets(req, res);
      return;
    }

    const oldFunctions = {
      write: res.write.bind(res),
      end: res.end.bind(res)
    };

    let storedBody = '';

    // New proxy functions.
    res.write = (chunk: any, ...args: any[]) => {

      const contentType = (res.getHeader('Content-Type') + '').split(';')[0];
      if (!contentType || !supportedContentTypes.includes(contentType)) {
        // Not supported
        return oldFunctions.write(chunk, ...args);
      }

      storedBody += chunk;
      return true;

    };
    // New proxy functions.
    res.end = (chunk: any, ...args: any[]) => {

      const contentType = (res.getHeader('Content-Type') + '').split(';')[0];

      if (!contentType || !supportedContentTypes.includes(contentType)) {
        // Not supported
        return oldFunctions.end(chunk, ...args);
      }

      storedBody += chunk;
      return handleBrowser(storedBody, oldFunctions, req, res, curveball);

    };

    next();

  };

}

async function handleBrowser(responseBody: string, oldFunctions: any, req: Request, res: Response, curveball: Application) {

  const ctx = curveball.buildContextFromHttp(req, res);
  ctx.response.body = responseBody;
  await curveball.handle(ctx);

  const buffer = Buffer.from(ctx.response.body);
  res.set('Content-Length', <any> buffer.length);
  oldFunctions.end(ctx.response.body);

}


async function handleAssets(req: Request, res: Response) {

  const baseUrl = '/_hal-browser/assets/';
  res.sendFile(
    req.path.substr(baseUrl.length),
    {
      root: require.resolve('hal-browser') + '/../../assets',
    }
  );

}
