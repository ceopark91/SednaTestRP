import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the sheets module
vi.mock("./sheets", () => ({
  fetchCompanies: vi.fn(async () => [
    "파이메탈",
    "바이오",
    "한글",
  ]),
  fetchIncompleteRecordsByCompany: vi.fn(async (company: string) => {
    if (company === "파이메탈") {
      return [
        {
          rowIndex: 10,
          status: "미완료",
          no: "1",
          company: "파이메탈",
          industry: "음료",
          commissioningDate: "",
          manager: "담당자1",
          model: "SRF200",
          serialNumber: "RF202403002",
          capacity: "",
          material: "",
          viscosity: "",
          rpm: "",
          kw: "1.1kw/6.94:1",
          hz: "",
          ampere: "",
          decibel: "",
          registeredDate: "2026.2.11",
        },
      ];
    }
    return [];
  }),
  updateCommissioningRecord: vi.fn(async () => {}),
  getCommissioningStats: vi.fn(async () => ({
    totalRecords: 14,
    completeRecords: 3,
    incompleteRecords: 11,
    completionRate: 21,
    byCompany: {
      파이메탈: { total: 8, complete: 1, incomplete: 7 },
      바이오: { total: 3, complete: 1, incomplete: 2 },
      한글: { total: 3, complete: 1, incomplete: 2 },
    },
  })),
}));

describe("Commissioning Router", () => {
  let context: TrpcContext;

  beforeEach(() => {
    context = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as unknown as TrpcContext["res"],
    };
  });

  describe("getCompanies", () => {
    it("should return list of companies", async () => {
      const caller = appRouter.createCaller(context);
      const result = await caller.commissioning.getCompanies();

      expect(result).toEqual(["파이메탈", "바이오", "한글"]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });
  });

  describe("getIncompleteRecords", () => {
    it("should return incomplete records for a company", async () => {
      const caller = appRouter.createCaller(context);
      const result = await caller.commissioning.getIncompleteRecords({
        company: "파이메탈",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].company).toBe("파이메탈");
      expect(result[0].model).toBe("SRF200");
      expect(result[0].status).toBe("미완료");
    });

    it("should return empty array for company with no incomplete records", async () => {
      const caller = appRouter.createCaller(context);
      const result = await caller.commissioning.getIncompleteRecords({
        company: "존재하지않는업체",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should validate company input", async () => {
      const caller = appRouter.createCaller(context);

      try {
        // @ts-ignore - intentionally passing invalid input
        await caller.commissioning.getIncompleteRecords({
          company: 123, // Invalid: should be string
        });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("submitRecord", () => {
    it("should submit commissioning record with valid data", async () => {
      const caller = appRouter.createCaller(context);
      const result = await caller.commissioning.submitRecord({
        rowIndex: 10,
        hz: "60Hz",
        ampere: "3.5A",
        commissioningDate: "2026-02-11",
      });

      expect(result).toEqual({ success: true });
    });

    it("should validate required fields", async () => {
      const caller = appRouter.createCaller(context);

      try {
        // @ts-ignore - intentionally passing incomplete data
        await caller.commissioning.submitRecord({
          rowIndex: 10,
          hz: "60Hz",
          // Missing ampere and commissioningDate
        });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should validate data types", async () => {
      const caller = appRouter.createCaller(context);

      try {
        // @ts-ignore - intentionally passing wrong type
        await caller.commissioning.submitRecord({
          rowIndex: "10", // Should be number
          hz: "60Hz",
          ampere: "3.5A",
          commissioningDate: "2026-02-11",
        });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getStats", () => {
    it("should return commissioning statistics", async () => {
      const caller = appRouter.createCaller(context);
      const result = await caller.commissioning.getStats();

      expect(result).toBeDefined();
      expect(result.totalRecords).toBe(14);
      expect(result.completeRecords).toBe(3);
      expect(result.incompleteRecords).toBe(11);
      expect(result.completionRate).toBe(21);
    });

    it("should include company breakdown in stats", async () => {
      const caller = appRouter.createCaller(context);
      const result = await caller.commissioning.getStats();

      expect(result.byCompany).toBeDefined();
      expect(result.byCompany["파이메탈"]).toBeDefined();
      expect(result.byCompany["파이메탈"].total).toBe(8);
      expect(result.byCompany["파이메탈"].complete).toBe(1);
      expect(result.byCompany["파이메탈"].incomplete).toBe(7);
    });

    it("should calculate completion rate correctly", async () => {
      const caller = appRouter.createCaller(context);
      const result = await caller.commissioning.getStats();

      const expectedRate = Math.round(
        (result.completeRecords / result.totalRecords) * 100
      );
      expect(result.completionRate).toBe(expectedRate);
    });
  });
});
