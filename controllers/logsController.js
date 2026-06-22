import Logs from "../models/logsModel";

function getRequestPath(req) {
    try {
        return new URL(req.url).pathname;
    } catch {
        return null;
    }
}

function getClientIp(req) {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || req.headers.get("x-real-ip")
        || null;
}

function cleanMetadata(metadata) {
    if (!metadata || typeof metadata !== "object") {
        return null;
    }

    return metadata;
}

export async function createLog(body) {
    return await Logs.create({
        type: body.type || "info",
        message: body.message || null,
        method: body.method || null,
        path: body.path || null,
        status_code: body.status_code || null,
        user_id: body.user_id || null,
        ip_address: body.ip_address || null,
        metadata: cleanMetadata(body.metadata)
    });
}

export async function createApiRequestLog(req, options = {}) {
    const userId = options.user_id || req.headers.get("x-user-id") || null;

    return await createLog({
        type: options.type || "api_request",
        message: options.message || `${req.method} ${getRequestPath(req)}`,
        method: req.method,
        path: getRequestPath(req),
        status_code: options.status_code || null,
        user_id: userId,
        ip_address: getClientIp(req),
        metadata: options.metadata || null
    });
}

export async function getLogs() {
    return await Logs.getAll();
}

export async function getLog(id) {
    return await Logs.getById(id);
}

export async function getLogsByUser(userId) {
    return await Logs.getByUser(userId);
}

export async function getLogsByType(type) {
    return await Logs.getByType(type);
}
