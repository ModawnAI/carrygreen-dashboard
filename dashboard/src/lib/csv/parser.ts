/**
 * CSV Parser for CarryGreen inverter data
 */

import Papa from 'papaparse';
import {
  InverterRecord,
  ParseResult,
  ParseError,
  RawCSVRow,
  Timestamp,
  UserRecord,
  InverterSupply,
  PVData,
  BatteryData,
  InverterData,
  GridData,
  SystemStatus,
} from '@/types';
import {
  validateVoltage,
  validateCurrent,
  validatePower,
  validateEnergy,
  validateTemperature,
  validateSOC,
  validateFrequency,
  validateDate,
  validateTime,
  validateBlackout,
  validateHex,
} from './validation';

/**
 * Papa Parse configuration for CarryGreen CSV files
 */
export const CSV_PARSE_CONFIG: Papa.ParseConfig = {
  header: true,
  skipEmptyLines: true,
  trimHeaders: true,
  dynamicTyping: false, // We'll handle type conversion manually
  transformHeader: (header: string) => {
    // Clean up header names and handle duplicates
    const cleanHeader = header.trim();
    switch (cleanHeader) {
      case 'Total kWh':
        return 'InvSupply_TotalKWh';
      case 'Voltage':
        return 'PV_Voltage';
      case 'Current':
        return 'PV_Current';
      case 'Power W':
        return 'PV_PowerW';
      case 'Daily Wh':
        return 'PV_DailyWh';
      case 'Monthly Wd':
        return 'PV_MonthlyWd';
      case 'Yearly Wm':
        return 'PV_YearlyWm';
      case 'Total kWh':
        return 'PV_TotalKWh';
      default:
        return cleanHeader;
    }
  },
};

/**
 * Creates a timestamp object from date and time strings
 */
function createTimestamp(date: string, time: string, rowIndex: number): {
  timestamp: Timestamp;
  errors: ParseError[];
} {
  const errors: ParseError[] = [];

  const dateValidation = validateDate(date, 'Date', rowIndex);
  const timeValidation = validateTime(time, 'Time', rowIndex);

  if (dateValidation.error) errors.push(dateValidation.error);
  if (timeValidation.error) errors.push(timeValidation.error);

  let datetime: string | undefined;
  if (!dateValidation.error && !timeValidation.error) {
    try {
      datetime = new Date(`${dateValidation.value}T${timeValidation.value}:00`).toISOString();
    } catch (e) {
      errors.push({
        row: rowIndex,
        field: 'datetime',
        value: `${date} ${time}`,
        message: 'Failed to create valid datetime',
        type: 'conversion',
      });
    }
  }

  return {
    timestamp: {
      date: dateValidation.value,
      time: timeValidation.value,
      datetime,
    },
    errors,
  };
}

/**
 * Parses a single CSV row into an InverterRecord
 */
function parseRow(row: any, rowIndex: number): {
  record?: InverterRecord;
  errors: ParseError[];
} {
  const errors: ParseError[] = [];

  // Create timestamp
  const timestampResult = createTimestamp(row.Date || '', row.Time || '', rowIndex);
  errors.push(...timestampResult.errors);

  // Parse blackout status
  const blackoutValidation = validateBlackout(row.Blackout || '', 'Blackout', rowIndex);
  if (blackoutValidation.error) errors.push(blackoutValidation.error);

  // User Record
  const userRecord: UserRecord = {
    id: row.ID || '',
    name: row.Name || '',
    timestamp: timestampResult.timestamp,
    blackout: blackoutValidation.value,
  };

  // Inverter Supply
  const invSupplyValidation = validateEnergy(row.InvSupply_TotalKWh || row['Total kWh'] || '', 'InvSupply_TotalKWh', rowIndex);
  if (invSupplyValidation.error) errors.push(invSupplyValidation.error);

  const inverterSupply: InverterSupply = {
    totalKWh: invSupplyValidation.value,
  };

  // PV Data
  const pvVoltageValidation = validateVoltage(row.PV_Voltage || row.Voltage || '', 'PV_Voltage', rowIndex);
  const pvCurrentValidation = validateCurrent(row.PV_Current || row.Current || '', 'PV_Current', rowIndex);
  const pvPowerValidation = validatePower(row.PV_PowerW || row['Power W'] || '', 'PV_PowerW', rowIndex);
  const pvDailyWhValidation = validateEnergy(row.PV_DailyWh || row['Daily Wh'] || '', 'PV_DailyWh', rowIndex);
  const pvMonthlyWdValidation = validateEnergy(row.PV_MonthlyWd || row['Monthly Wd'] || '', 'PV_MonthlyWd', rowIndex);
  const pvYearlyWmValidation = validateEnergy(row.PV_YearlyWm || row['Yearly Wm'] || '', 'PV_YearlyWm', rowIndex);
  const pvTotalKWhValidation = validateEnergy(row.PV_TotalKWh || row['Total kWh'] || '', 'PV_TotalKWh', rowIndex);

  [pvVoltageValidation, pvCurrentValidation, pvPowerValidation, pvDailyWhValidation,
   pvMonthlyWdValidation, pvYearlyWmValidation, pvTotalKWhValidation].forEach(validation => {
    if (validation.error) errors.push(validation.error);
  });

  const pv: PVData = {
    voltage: pvVoltageValidation.value,
    current: pvCurrentValidation.value,
    powerW: pvPowerValidation.value,
    dailyWh: pvDailyWhValidation.value,
    monthlyWd: pvMonthlyWdValidation.value,
    yearlyWm: pvYearlyWmValidation.value,
    totalKWh: pvTotalKWhValidation.value,
  };

  // Battery Data
  const batteryVoltageValidation = validateVoltage(row.Voltage_1 || '', 'Battery_Voltage', rowIndex);
  const batteryCurrentValidation = validateCurrent(row.Current_1 || '', 'Battery_Current', rowIndex);
  const batteryTempValidation = validateTemperature(row.Temp || '', 'Battery_Temp', rowIndex);
  const batterySOCValidation = validateSOC(row.SOC || '', 'Battery_SOC', rowIndex);

  [batteryVoltageValidation, batteryCurrentValidation, batteryTempValidation, batterySOCValidation].forEach(validation => {
    if (validation.error) errors.push(validation.error);
  });

  const battery: BatteryData = {
    voltage: batteryVoltageValidation.value,
    current: batteryCurrentValidation.value,
    temperature: batteryTempValidation.value,
    soc: batterySOCValidation.value,
  };

  // Inverter Data
  const inverterVoltageValidation = validateVoltage(row.Voltage_2 || '', 'Inverter_Voltage', rowIndex);
  const inverterCurrentValidation = validateCurrent(row.Current_2 || '', 'Inverter_Current', rowIndex);
  const inverterFreqValidation = validateFrequency(row.Hz || '', 'Inverter_Frequency', rowIndex);

  [inverterVoltageValidation, inverterCurrentValidation, inverterFreqValidation].forEach(validation => {
    if (validation.error) errors.push(validation.error);
  });

  const inverter: InverterData = {
    voltage: inverterVoltageValidation.value,
    current: inverterCurrentValidation.value,
    frequency: inverterFreqValidation.value,
  };

  // Grid Data
  const gridVoltageValidation = validateVoltage(row.Voltage_3 || '', 'Grid_Voltage', rowIndex);
  const gridCurrentValidation = validateCurrent(row.Current_3 || '', 'Grid_Current', rowIndex);
  const gridFreqValidation = validateFrequency(row.Hz_1 || '', 'Grid_Frequency', rowIndex);

  [gridVoltageValidation, gridCurrentValidation, gridFreqValidation].forEach(validation => {
    if (validation.error) errors.push(validation.error);
  });

  const grid: GridData = {
    voltage: gridVoltageValidation.value,
    current: gridCurrentValidation.value,
    frequency: gridFreqValidation.value,
  };

  // System Status
  const hexValidation = validateHex(row.Hex || '', 'Status_Hex', rowIndex);
  if (hexValidation.error) errors.push(hexValidation.error);

  const status: SystemStatus = {
    hex: hexValidation.value,
  };

  // Only create record if we have minimal required data
  if (!userRecord.id && !timestampResult.timestamp.date) {
    errors.push({
      row: rowIndex,
      field: 'record',
      value: 'incomplete',
      message: 'Row missing required ID or date information',
      type: 'validation',
    });
    return { errors };
  }

  const record: InverterRecord = {
    userRecord,
    inverterSupply,
    pv,
    battery,
    inverter,
    grid,
    status,
  };

  return { record, errors };
}

/**
 * Parses CSV content and returns structured data
 */
export function parseCSV(csvContent: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const allErrors: ParseError[] = [];
    const records: InverterRecord[] = [];
    let totalRows = 0;

    Papa.parse(csvContent, {
      ...CSV_PARSE_CONFIG,
      complete: (results) => {
        totalRows = results.data.length;

        results.data.forEach((row: any, index: number) => {
          const rowIndex = index + 2; // +2 because index is 0-based and we skip header

          const parseResult = parseRow(row, rowIndex);

          if (parseResult.record) {
            records.push(parseResult.record);
          }

          allErrors.push(...parseResult.errors);
        });

        // Add any Papa Parse errors
        if (results.errors && results.errors.length > 0) {
          results.errors.forEach((error: Papa.ParseError) => {
            allErrors.push({
              row: error.row ? error.row + 1 : 0,
              field: 'parsing',
              value: '',
              message: error.message,
              type: 'format',
            });
          });
        }

        resolve({
          data: records,
          errors: allErrors,
          totalRows,
          successfulRows: records.length,
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [{
            row: 0,
            field: 'file',
            value: '',
            message: error.message,
            type: 'format',
          }],
          totalRows: 0,
          successfulRows: 0,
        });
      },
    });
  });
}

/**
 * Parses CSV file and returns structured data
 */
export function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const result = await parseCSV(content);
      resolve(result);
    };

    reader.onerror = () => {
      resolve({
        data: [],
        errors: [{
          row: 0,
          field: 'file',
          value: file.name,
          message: 'Failed to read file',
          type: 'format',
        }],
        totalRows: 0,
        successfulRows: 0,
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Utility function to format parse errors for display
 */
export function formatParseErrors(errors: ParseError[]): string {
  if (errors.length === 0) return 'No errors';

  const errorsByType = errors.reduce((acc, error) => {
    if (!acc[error.type]) acc[error.type] = [];
    acc[error.type].push(error);
    return acc;
  }, {} as Record<string, ParseError[]>);

  let message = `Found ${errors.length} error(s):\n`;

  Object.entries(errorsByType).forEach(([type, typeErrors]) => {
    message += `\n${type.toUpperCase()} errors (${typeErrors.length}):\n`;
    typeErrors.slice(0, 5).forEach(error => {
      message += `  Row ${error.row}, ${error.field}: ${error.message}\n`;
    });
    if (typeErrors.length > 5) {
      message += `  ... and ${typeErrors.length - 5} more\n`;
    }
  });

  return message;
}