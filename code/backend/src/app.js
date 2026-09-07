import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import { ApiError } from "./utils/ApiError.js"

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

app.use("/api/v1/auth", authRouter)

// Centralized error handler — every ApiError thrown anywhere in the app
// (routes, middlewares, asyncHandler-wrapped controllers) is formatted
// into the project's standard JSON response shape here, instead of
// falling through to Express's default HTML error page.
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            data: err.data,
            message: err.message,
            success: err.success,
            errors: err.errors,
        })
    }

    console.error(err)

    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        statusCode,
        data: null,
        message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
        success: false,
        errors: [],
    })
})

export { app }