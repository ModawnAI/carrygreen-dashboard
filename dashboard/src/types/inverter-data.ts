/**
 * CarryGreen Inverter Data Types
 *
 * TypeScript interfaces for parsing and handling inverter data from CSV files.
 * These interfaces represent the structure of data collected from inverter systems.
 */

/**
 * Timestamp information for each data record
 */
export interface Timestamp {
  /** Full date string in YYYY-MM-DD format */
  date: string;
  /** Time string in HH:MM format */
  time: string;
  /** Combined datetime as ISO string for calculations */
  datetime?: string;
}

/**
 * User and device identification information
 */
export interface UserRecord {
  /** Unique device identifier */
  id: string;
  /** Device/inverter name */
  name: string;
  /** Timestamp information */
  timestamp: Timestamp;
  /** Blackout status indicator */
  blackout: boolean | null;
}

/**
 * Inverter supply and total energy information
 */
export interface InverterSupply {
  /** Total kilowatt hours supplied */
  totalKWh: number;
}

/**
 * Photovoltaic (Solar Panel) data
 */
export interface PVData {
  /** Voltage in volts */
  voltage: number;
  /** Current in amperes */
  current: number;
  /** Power in watts */
  powerW: number;
  /** Daily watt hours */
  dailyWh: number;
  /** Monthly watt days */
  monthlyWd: number;
  /** Yearly watt months */
  yearlyWm: number;
  /** Total kilowatt hours generated */
  totalKWh: number;
}

/**
 * Battery system data
 */
export interface BatteryData {
  /** Battery voltage in volts */
  voltage: number;
  /** Battery current in amperes */
  current: number;
  /** Battery temperature in degrees Celsius */
  temperature: number;
  /** State of Charge as percentage (0-100) */
  soc: number;
}

/**
 * Inverter system data
 */
export interface InverterData {
  /** Output voltage in volts */
  voltage: number;
  /** Output current in amperes */
  current: number;
  /** Output frequency in Hz */
  frequency: number;
}

/**
 * Grid connection data
 */
export interface GridData {
  /** Grid voltage in volts */
  voltage: number;
  /** Grid current in amperes */
  current: number;
  /** Grid frequency in Hz */
  frequency: number;
}

/**
 * System status information
 */
export interface SystemStatus {
  /** Hexadecimal status code */
  hex: string;
  /** Parsed status flags (to be implemented) */
  flags?: {
    [key: string]: boolean;
  };
}

/**
 * Complete inverter data record
 * Represents a single row of data from the CSV file
 */
export interface InverterRecord {
  /** User and device information */
  userRecord: UserRecord;
  /** Inverter supply information */
  inverterSupply: InverterSupply;
  /** Photovoltaic data */
  pv: PVData;
  /** Battery data */
  battery: BatteryData;
  /** Inverter data */
  inverter: InverterData;
  /** Grid data */
  grid: GridData;
  /** System status */
  status: SystemStatus;
}

/**
 * Raw CSV row data (before parsing)
 */
export interface RawCSVRow {
  ID: string;
  Date: string;
  Time: string;
  Name: string;
  Blackout: string;
  "Total kWh": string;
  "Voltage": string; // PV Voltage
  "Current": string; // PV Current
  "Power W": string;
  "Daily Wh": string;
  "Monthly Wd": string;
  "Yearly Wm": string;
  "Total kWh_1": string; // PV Total kWh
  "Voltage_1": string; // Battery Voltage
  "Current_1": string; // Battery Current
  "Temp": string;
  "SOC": string;
  "Voltage_2": string; // Inverter Voltage
  "Current_2": string; // Inverter Current
  "Hz": string; // Inverter Hz
  "Voltage_3": string; // Grid Voltage
  "Current_3": string; // Grid Current
  "Hz_1": string; // Grid Hz
  "Hex": string;
}

/**
 * Parsing error information
 */
export interface ParseError {
  /** Row number where error occurred */
  row: number;
  /** Field name that caused the error */
  field: string;
  /** Original value that couldn't be parsed */
  value: string;
  /** Error message */
  message: string;
  /** Error type */
  type: 'validation' | 'conversion' | 'missing' | 'format';
}

/**
 * Parsing result containing data and any errors
 */
export interface ParseResult {
  /** Successfully parsed records */
  data: InverterRecord[];
  /** Any errors encountered during parsing */
  errors: ParseError[];
  /** Total number of rows processed */
  totalRows: number;
  /** Number of successfully parsed rows */
  successfulRows: number;
}

/**
 * Data aggregation options
 */
export interface AggregationOptions {
  /** Time interval for aggregation */
  interval: 'minute' | 'hour' | 'day' | 'month';
  /** Fields to aggregate */
  fields?: Array<keyof PVData | keyof BatteryData | keyof InverterData | keyof GridData>;
  /** Aggregation method */
  method: 'average' | 'sum' | 'min' | 'max';
}

/**
 * Aggregated data result
 */
export interface AggregatedData {
  /** Time period for this aggregation */
  period: string;
  /** Aggregated values */
  values: {
    [field: string]: number;
  };
  /** Number of records included in aggregation */
  count: number;
}