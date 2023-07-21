import "reflect-metadata";
import * as ON_DEATH from "death";
import { SocketChatServer } from "./server";
import { getLogger } from "./logging";


const LOGGER = getLogger('main');


// create server
const server = new SocketChatServer();
// start server
server.start()
    .then(() => {
        // SIGTERM
        ON_DEATH((signal, err) => {
            server.close().then(() => process.exit());
        });
    })
    .catch(error => LOGGER.error(`Failed to start server: ${error}`));
