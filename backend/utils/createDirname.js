import { fileURLToPath } from "url";
import { dirname } from "path";

//Setting up the correct file pathway to our DB

const createDirname = (url) => {
  const __filename = fileURLToPath(url);
  const __dirname = dirname(__filename);
  return __dirname;
};

export default createDirname;
