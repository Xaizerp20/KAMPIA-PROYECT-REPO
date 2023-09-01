import path from 'path';
import { fileURLToPath } from 'url';


//DIRECCION RELATIVA
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//ROUTS VIEWS
const pageIndex = path.join(__dirname, 'views/index.html');
const pageLogin = path.resolve(__dirname, './views/login.html');
const pageMap = path.resolve(__dirname, 'views/map.html');
const pageAdmin = path.resolve(__dirname, 'views/admin.html');


export default {
    pageIndex,
    pageLogin,
    pageMap,
    pageAdmin,
    __filename,
    __dirname,
  };
