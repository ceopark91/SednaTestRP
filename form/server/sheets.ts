import { parse } from "csv-parse/sync";

const SPREADSHEET_ID = "1fGEYkgJkgeNmGYUXVz9h2dL8QOvCBFt6qEI0YB_Ik_4";
const SHEET_GID = "2000476504"; // GID for "시운전 정보 관리" sheet

// CSV export URL for public sheets (no auth needed)
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

export interface SheetRow {
  rowIndex: number;
  status: string;
  no: string;
  company: string;
  industry: string;
  commissioningDate: string;
  manager: string;
  model: string;
  serialNumber: string;
  capacity: string;
  material: string;
  viscosity: string;
  rpm: string;
  kw: string;
  hz: string;
  ampere: string;
  decibel: string;
  registeredDate: string;
}

/**
 * Fetch all data from the commissioning sheet via CSV export
 */
export async function fetchSheetData(): Promise<SheetRow[]> {
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    const csvText = await response.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    const dataRows: SheetRow[] = [];

    records.forEach((record, index) => {
      // Skip empty rows
      if (!record["상태"] && !record["업체명"]) return;

      dataRows.push({
        rowIndex: index + 2, // Sheet row number (1-indexed, +1 for header)
        status: record["상태"] || "",
        no: record["No."] || "",
        company: record["업체명"] || "",
        industry: record["산업군"] || "",
        commissioningDate: record["시운전 날짜"] || "",
        manager: record["담당자명"] || "",
        model: record["모델"] || "",
        serialNumber: record["S/N"] || "",
        capacity: record["워킹용량"] || "",
        material: record["원료"] || "",
        viscosity: record["점도"] || "",
        rpm: record["RPM"] || "",
        kw: record["KW"] || "",
        hz: record["Hz"] || "",
        ampere: record["A"] || "",
        decibel: record["dB(정격)"] || "",
        registeredDate: record["등록일시"] || "",
      });
    });

    console.log(`[Sheets] Fetched ${dataRows.length} records from sheet`);
    return dataRows;
  } catch (error) {
    console.error("[Sheets] Error fetching data:", error);
    throw error;
  }
}

/**
 * Get unique companies from the sheet
 */
export async function fetchCompanies(): Promise<string[]> {
  const rows = await fetchSheetData();
  const companies = new Set<string>();

  rows.forEach((row) => {
    if (row.company && row.company.trim()) {
      companies.add(row.company.trim());
    }
  });

  return Array.from(companies).sort();
}

/**
 * Get incomplete records for a specific company
 */
export async function fetchIncompleteRecordsByCompany(
  company: string
): Promise<SheetRow[]> {
  const rows = await fetchSheetData();
  return rows.filter(
    (row) =>
      row.company === company &&
      (row.status === "미완료" || row.status === "incomplete")
  );
}

/**
 * Update a specific cell in the sheet via Google Sheets API
 * Note: This requires proper authentication - for now using a placeholder
 */
export async function updateSheetCell(
  rowIndex: number,
  columnIndex: number,
  value: string
): Promise<void> {
  try {
    // For public sheets without write access, we'll log the update
    // In production, you would need to set up OAuth or service account
    console.log(
      `[Sheets] Would update cell at row ${rowIndex}, column ${columnIndex} with value: ${value}`
    );
    
    // Placeholder for actual update logic
    // This would require Google Sheets API with proper authentication
  } catch (error) {
    console.error("[Sheets] Error updating cell:", error);
    throw error;
  }
}

/**
 * Update multiple cells in a row (Hz, Ampere, CommissioningDate, Status)
 * Note: This requires proper authentication
 */
export async function updateCommissioningRecord(
  rowIndex: number,
  data: {
    hz?: string;
    ampere?: string;
    commissioningDate?: string;
  }
): Promise<void> {
  try {
    console.log(
      `[Sheets] Would update row ${rowIndex} with data:`,
      data
    );

    // For now, just log the update
    // In production, you would need to implement actual Google Sheets API write operations
    // This would require OAuth2 authentication or service account setup
  } catch (error) {
    console.error("[Sheets] Error updating commissioning record:", error);
    throw error;
  }
}

/**
 * Get statistics for dashboard
 */
export async function getCommissioningStats(): Promise<{
  totalRecords: number;
  completeRecords: number;
  incompleteRecords: number;
  completionRate: number;
  byCompany: Record<
    string,
    { total: number; complete: number; incomplete: number }
  >;
}> {
  const rows = await fetchSheetData();
  const stats = {
    totalRecords: rows.length,
    completeRecords: 0,
    incompleteRecords: 0,
    completionRate: 0,
    byCompany: {} as Record<
      string,
      { total: number; complete: number; incomplete: number }
    >,
  };

  rows.forEach((row) => {
    const isComplete = row.status === "완료" || row.status === "complete";
    if (isComplete) {
      stats.completeRecords++;
    } else {
      stats.incompleteRecords++;
    }

    const company = row.company || "Unknown";
    if (!stats.byCompany[company]) {
      stats.byCompany[company] = { total: 0, complete: 0, incomplete: 0 };
    }
    stats.byCompany[company].total++;
    if (isComplete) {
      stats.byCompany[company].complete++;
    } else {
      stats.byCompany[company].incomplete++;
    }
  });

  stats.completionRate =
    stats.totalRecords > 0
      ? Math.round((stats.completeRecords / stats.totalRecords) * 100)
      : 0;

  return stats;
}
