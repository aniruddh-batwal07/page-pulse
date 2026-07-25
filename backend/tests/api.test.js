"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_js_1 = __importDefault(require("../src/app.js"));
const html_fixtures_js_1 = require("./fixtures/html.fixtures.js");
// ─── Mock pageFetcher ─────────────────────────────────────────────────────────
//
// We mock the fetcher module so API tests never hit the network.
// The mock is defined at module scope so vi.mock hoisting works correctly.
// Each test can override the resolved value via mockResolvedValue().
vitest_1.vi.mock("../src/utils/pageFetcher.js", () => ({
    fetchPage: vitest_1.vi.fn(),
}));
// Import AFTER mock declaration so we get the mocked version
const pageFetcher_js_1 = require("../src/utils/pageFetcher.js");
const mockFetchPage = pageFetcher_js_1.fetchPage;
(0, vitest_1.describe)("POST /api/v1/audit", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    // ── Validation ─────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("request validation", () => {
        (0, vitest_1.it)("returns 400 when body is empty", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default).post("/api/v1/audit").send({});
            (0, vitest_1.expect)(res.status).toBe(400);
        });
        (0, vitest_1.it)("returns 400 when url field is missing", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ website: "https://example.com" });
            (0, vitest_1.expect)(res.status).toBe(400);
        });
        (0, vitest_1.it)("returns 400 when url is not a valid URL string", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "not-a-url" });
            (0, vitest_1.expect)(res.status).toBe(400);
        });
        (0, vitest_1.it)("returns 400 when url is an empty string", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "" });
            (0, vitest_1.expect)(res.status).toBe(400);
        });
    });
    // ── Successful audit ───────────────────────────────────────────────────────
    (0, vitest_1.describe)("valid request", () => {
        (0, vitest_1.beforeEach)(() => {
            mockFetchPage.mockResolvedValue({
                html: html_fixtures_js_1.PERFECT_HTML,
                finalUrl: "https://example.com",
                statusCode: 200,
            });
        });
        (0, vitest_1.it)("returns 200 for a valid URL", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(res.status).toBe(200);
        });
        (0, vitest_1.it)("response has success: true", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(res.body.success).toBe(true);
        });
        (0, vitest_1.it)("response contains parsedData", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(res.body.data.parsedData).toBeDefined();
        });
        (0, vitest_1.it)("response contains analysis with issues array", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(Array.isArray(res.body.data.analysis.issues)).toBe(true);
        });
        (0, vitest_1.it)("response contains scores with overallScore", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(typeof res.body.data.scores.overallScore).toBe("number");
        });
        (0, vitest_1.it)("response contains recommendations array", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(Array.isArray(res.body.data.recommendations)).toBe(true);
        });
        (0, vitest_1.it)("calls fetchPage with the submitted URL", async () => {
            await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(mockFetchPage).toHaveBeenCalledWith("https://example.com");
        });
        (0, vitest_1.it)("perfect HTML produces zero issues", async () => {
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(res.body.data.analysis.issues).toHaveLength(0);
            (0, vitest_1.expect)(res.body.data.recommendations).toHaveLength(0);
        });
    });
    // ── Fetcher errors propagate ───────────────────────────────────────────────
    (0, vitest_1.describe)("upstream errors", () => {
        (0, vitest_1.it)("returns 5xx when the fetcher throws", async () => {
            mockFetchPage.mockRejectedValue(new Error("Connection refused"));
            const res = await (0, supertest_1.default)(app_js_1.default)
                .post("/api/v1/audit")
                .send({ url: "https://example.com" });
            (0, vitest_1.expect)(res.status).toBeGreaterThanOrEqual(500);
        });
    });
});
