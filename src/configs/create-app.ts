import express, { Express } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Respond from '@/lib/respond';
import serveEmojiFavicon from '@/middlewares/serveEmojiFavicon';
import requestLogger from '@/middlewares/requestLogger';
import { errorHandler } from '@/middlewares/error-handler';
import router from '@/modules';
import { auth } from '@/lib/auth';
import { toNodeHandler } from "better-auth/node";
import sessionDeserializer from '@/middlewares/session-deserializer';
import { cache } from '@/middlewares/cache-handler';

const allowedOrigins = ['http://localhost:3000'];
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  });

export function createRouter() {
  return express()
}

export default function createApp() {
    const app = createRouter();
  
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "'unsafe-inline'", "data:", "https:", "http:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "data:", "https:", "http:"],
          styleSrc: ["'self'", "'unsafe-inline'", "data:", "https:", "http:"],
          imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
          connectSrc: ["'self'", ...allowedOrigins, "https:", "http:", "ws:", "wss:"],
          fontSrc: ["'self'", "https:", "http:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", "data:", "https:", "http:"],
          frameSrc: ["'self'", "data:", "https:", "http:"],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["'self'", "blob:"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: { policy: "unsafe-none" },
    }));
    app.use(cookieParser());
    app.use(express.json({ limit: '2048mb' }));
    app.use(express.urlencoded({ extended: true, limit: '2048mb' }));
    app.use(requestLogger());
    app.use(
        cors({
          credentials: true,
          origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'));
            }
          },
        })
      );
    app.use(limiter);
    app.use(serveEmojiFavicon('🔥'));
    app.all("/api/auth/*splat", toNodeHandler(auth));
    app.use(sessionDeserializer);
    app.use(cache());

    app.get('/', (_, res) => {
        Respond(res, { message: 'API services are nominal!!' }, 200);
    });
    app.use('/api/v1', router);

    app.use(errorHandler);
    return app;
}
