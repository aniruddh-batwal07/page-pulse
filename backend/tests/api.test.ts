import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { PERFECT_HTML } from "./fixtures/html.fixtures.js";

// ─── Mock pageFetcher ─────────────────────────────────────────────────────────
//
// We mock the fetcher module so API tests never hit the network.
// The mock is defined at module scope so vi.mock hoisting works correctly.
// Each test can override the resolved value via mockResolvedValue().

vi.mock("../src/utils/pageFetcher.js", () => ({
  fetchPage: vi.fn(),
}));

// Import AFTER mock declaration so we get the mocked version
import { fetchPage } from "../src/utils/pageFetcher.js";
const mockFetchPage = fetchPage as ReturnType<typeof vi.fn>;

describe("POST /api/v1/audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  describe("request validation", () => {
    it("returns 400 when body is empty", async () => {
      const res = await request(app).post("/api/v1/audit").send({});
      expect(res.status).toBe(400);
    });

    it("returns 400 when url field is missing", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ website: "https://example.com" });
      expect(res.status).toBe(400);
    });

    it("returns 400 when url is not a valid URL string", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "not-a-url" });
      expect(res.status).toBe(400);
    });

    it("returns 400 when url is an empty string", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "" });
      expect(res.status).toBe(400);
    });
  });

  // ── Successful audit ───────────────────────────────────────────────────────

  describe("valid request", () => {
    beforeEach(() => {
      mockFetchPage.mockResolvedValue({
        html: PERFECT_HTML,
        finalUrl: "https://example.com",
        statusCode: 200,
      });
    });

    it("returns 200 for a valid URL", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(res.status).toBe(200);
    });

    it("response has success: true", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(res.body.success).toBe(true);
    });

    it("response contains parsedData", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(res.body.data.parsedData).toBeDefined();
    });

    it("response contains analysis with issues array", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(Array.isArray(res.body.data.analysis.issues)).toBe(true);
    });

    it("response contains scores with overallScore", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(typeof res.body.data.scores.overallScore).toBe("number");
    });

    it("response contains recommendations array", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    });

    it("calls fetchPage with the submitted URL", async () => {
      await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(mockFetchPage).toHaveBeenCalledWith("https://example.com");
    });

    it("perfect HTML produces zero issues", async () => {
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(res.body.data.analysis.issues).toHaveLength(0);
      expect(res.body.data.recommendations).toHaveLength(0);
    });
  });

  // ── Fetcher errors propagate ───────────────────────────────────────────────

  describe("upstream errors", () => {
    it("returns 5xx when the fetcher throws", async () => {
      mockFetchPage.mockRejectedValue(new Error("Connection refused"));
      const res = await request(app)
        .post("/api/v1/audit")
        .send({ url: "https://example.com" });
      expect(res.status).toBeGreaterThanOrEqual(500);
    });
  });
});
