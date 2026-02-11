import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Commissioning management routes
  commissioning: router({
    // Get all companies
    getCompanies: publicProcedure.query(async () => {
      const { fetchCompanies } = await import("./sheets");
      return fetchCompanies();
    }),

    // Get incomplete records for a company
    getIncompleteRecords: publicProcedure.input(z.object({
      company: z.string(),
    })).query(async ({ input }) => {
      const { fetchIncompleteRecordsByCompany } = await import("./sheets");
      return fetchIncompleteRecordsByCompany(input.company);
    }),

    // Submit commissioning data
    submitRecord: publicProcedure.input(z.object({
      rowIndex: z.number(),
      hz: z.string(),
      ampere: z.string(),
      commissioningDate: z.string(),
    })).mutation(async ({ input }) => {
      const { updateCommissioningRecord } = await import("./sheets");
      await updateCommissioningRecord(input.rowIndex, {
        hz: input.hz,
        ampere: input.ampere,
        commissioningDate: input.commissioningDate,
      });
      return { success: true };
    }),

    // Get dashboard statistics
    getStats: publicProcedure.query(async () => {
      const { getCommissioningStats } = await import("./sheets");
      return getCommissioningStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
