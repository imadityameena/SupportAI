import { connect } from "mongoose"

let cache = global.mongoose
if (!cache) {
    cache = global.mongoose = { conn: null, promise: null }
}

const connectDb = async () => {
    if (cache.conn) {
        return cache.conn
    }

    const mongoUrl = process.env.MONGODB_URL
    if (!mongoUrl) {
        throw new Error("MONGODB_URL is not set")
    }

    if (!cache.promise) {
        cache.promise = connect(mongoUrl, { serverSelectionTimeoutMS: 5000 }).then((c) => c.connection)
    }

    try {
        cache.conn = await cache.promise
    } catch (error) {
        // Drop the failed promise so the next request retries instead of failing forever.
        cache.promise = null
        throw error
    }

    return cache.conn
}

export default connectDb
