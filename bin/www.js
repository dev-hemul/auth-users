import dbRunner from "./runners/db.js";
import httpRunner from './runners/http.js';

await dbRunner();
await httpRunner();
