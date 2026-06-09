import express, { type NextFunction, type Request, type Response } from "express";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { resolve } from "node:path";

if (existsSync(".env")) {
  loadEnvFile(".env");
}

const { config } = await import("./config.js");
const { errorHandler, notFound } = await import("./middlewares/error-handler.js");
const { sameOrigin, securityHeaders } = await import("./middlewares/security.js");
const { apiRouter } = await import("./routes/index.js");

const app = express();
const publicDirectory = resolve("dist/public");
const spaIndex = resolve(publicDirectory, "index.html");

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(sameOrigin);
app.use(express.json({ limit: "100kb", type: "application/json" }));
app.use("/api", apiRouter);
app.use("/api", notFound);
app.use(express.static(publicDirectory, { index: false }));
app.get(
  "*path",
  (request: Request, response: Response, next: NextFunction): void => {
    if (!request.accepts("html") || !existsSync(spaIndex)) {
      notFound(request, response);
      return;
    }
    response.sendFile(spaIndex, (error) => {
      if (error) {
        next(error);
      }
    });
  },
);
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server listening on ${config.appOrigin}`);
});
