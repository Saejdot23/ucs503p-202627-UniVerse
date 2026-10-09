import dotenv from "dotenv";
import http from "http";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initSocketServer } from "./socket.js";

dotenv.config({ path: "./.env" });

connectDB()
    .then(() => {
        const httpServer = http.createServer(app);
        initSocketServer(httpServer);

        app.on("error", (error) => {
            console.log("Error: ", error);
            throw error;
        });

        httpServer.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at: ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGODB connection failed!", err);
    });
