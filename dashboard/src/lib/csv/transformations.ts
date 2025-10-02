/**
 * Data transformation utilities for CarryGreen inverter data
 */

import { InverterRecord, AggregatedData, AggregationOptions } from '@/types';

/**
 * Filters records by date range
 */
export function filterByDateRange(
  records: InverterRecord[],
  startDate: string,
  endDate: string
): InverterRecord[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return records.filter(record => {
    if (!record.userRecord.timestamp.datetime) return false;
    const recordDate = new Date(record.userRecord.timestamp.datetime);
    return recordDate >= start && recordDate <= end;
  });
}

/**
 * Filters records by device ID
 */
export function filterByDeviceId(
  records: InverterRecord[],
  deviceId: string
): InverterRecord[] {
  return records.filter(record => record.userRecord.id === deviceId);
}

/**
 * Gets unique device IDs from records
 */
export function getUniqueDeviceIds(records: InverterRecord[]): string[] {
  const ids = new Set(records.map(record => record.userRecord.id));
  return Array.from(ids).filter(Boolean);
}

/**
 * Gets date range from records
 */
export function getDateRange(records: InverterRecord[]): {
  start: string | null;
  end: string | null;
} {
  if (records.length === 0) return { start: null, end: null };

  const dates = records
    .map(record => record.userRecord.timestamp.datetime)
    .filter(Boolean)
    .map(date => new Date(date!))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return { start: null, end: null };

  return {
    start: dates[0].toISOString(),
    end: dates[dates.length - 1].toISOString(),
  };
}

/**
 * Aggregates data by time interval
 */
export function aggregateData(
  records: InverterRecord[],
  options: AggregationOptions
): AggregatedData[] {
  if (records.length === 0) return [];

  // Group records by time interval
  const groups = groupByTimeInterval(records, options.interval);

  // Aggregate each group
  return Object.entries(groups).map(([period, groupRecords]) => {
    const values: { [field: string]: number } = {};

    // Default fields to aggregate if not specified
    const fieldsToAggregate = options.fields || [
      'powerW' as keyof typeof records[0]['pv'],
      'voltage' as keyof typeof records[0]['battery'],
      'soc' as keyof typeof records[0]['battery'],
      'voltage' as keyof typeof records[0]['inverter'],
      'voltage' as keyof typeof records[0]['grid'],
    ];

    fieldsToAggregate.forEach(field => {
      const fieldValues = extractFieldValues(groupRecords, field as string);
      values[field as string] = calculateAggregation(fieldValues, options.method);
    });

    return {
      period,
      values,
      count: groupRecords.length,
    };
  });
}

/**
 * Groups records by time interval
 */
function groupByTimeInterval(
  records: InverterRecord[],
  interval: 'minute' | 'hour' | 'day' | 'month'
): Record<string, InverterRecord[]> {
  const groups: Record<string, InverterRecord[]> = {};

  records.forEach(record => {
    if (!record.userRecord.timestamp.datetime) return;

    const date = new Date(record.userRecord.timestamp.datetime);
    let key: string;

    switch (interval) {
      case 'minute':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        break;
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
  });

  return groups;
}

/**
 * Extracts values for a specific field from records
 */
function extractFieldValues(records: InverterRecord[], fieldPath: string): number[] {
  return records.map(record => {
    // Handle nested field paths like 'pv.powerW', 'battery.voltage', etc.
    const parts = fieldPath.split('.');
    let value: any = record;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        // Try direct field access for backward compatibility
        if (fieldPath === 'powerW') value = record.pv.powerW;
        else if (fieldPath === 'voltage' && record.battery) value = record.battery.voltage;
        else if (fieldPath === 'soc') value = record.battery.soc;
        else return 0;
        break;
      }
    }

    return typeof value === 'number' ? value : 0;
  }).filter(val => !isNaN(val));
}

/**
 * Calculates aggregation based on method
 */
function calculateAggregation(values: number[], method: 'average' | 'sum' | 'min' | 'max'): number {
  if (values.length === 0) return 0;

  switch (method) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'average':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return 0;
  }
}

/**
 * Calculates basic statistics for a dataset
 */
export function calculateStatistics(records: InverterRecord[]) {
  if (records.length === 0) return null;

  const powerValues = records.map(r => r.pv.powerW).filter(v => v > 0);
  const batterySOC = records.map(r => r.battery.soc).filter(v => v >= 0);
  const batteryTemp = records.map(r => r.battery.temperature);

  return {
    totalRecords: records.length,
    dateRange: getDateRange(records),
    power: {
      max: powerValues.length > 0 ? Math.max(...powerValues) : 0,
      average: powerValues.length > 0 ? powerValues.reduce((a, b) => a + b) / powerValues.length : 0,
      totalEnergy: records.reduce((sum, r) => sum + r.pv.totalKWh, 0),
    },
    battery: {
      averageSOC: batterySOC.length > 0 ? batterySOC.reduce((a, b) => a + b) / batterySOC.length : 0,
      minSOC: batterySOC.length > 0 ? Math.min(...batterySOC) : 0,
      maxSOC: batterySOC.length > 0 ? Math.max(...batterySOC) : 0,
      averageTemp: batteryTemp.length > 0 ? batteryTemp.reduce((a, b) => a + b) / batteryTemp.length : 0,
    },
    devices: getUniqueDeviceIds(records),
  };
}

/**
 * Converts records to CSV format
 */
export function recordsToCSV(records: InverterRecord[]): string {
  if (records.length === 0) return '';

  const headers = [
    'ID', 'Date', 'Time', 'Name', 'Blackout', 'Inv_Total_kWh',
    'PV_Voltage', 'PV_Current', 'PV_Power_W', 'PV_Daily_Wh', 'PV_Monthly_Wd', 'PV_Yearly_Wm', 'PV_Total_kWh',
    'Battery_Voltage', 'Battery_Current', 'Battery_Temp', 'Battery_SOC',
    'Inverter_Voltage', 'Inverter_Current', 'Inverter_Hz',
    'Grid_Voltage', 'Grid_Current', 'Grid_Hz', 'Status_Hex'
  ];

  const rows = records.map(record => [
    record.userRecord.id,
    record.userRecord.timestamp.date,
    record.userRecord.timestamp.time,
    record.userRecord.name,
    record.userRecord.blackout?.toString() || '',
    record.inverterSupply.totalKWh,
    record.pv.voltage,
    record.pv.current,
    record.pv.powerW,
    record.pv.dailyWh,
    record.pv.monthlyWd,
    record.pv.yearlyWm,
    record.pv.totalKWh,
    record.battery.voltage,
    record.battery.current,
    record.battery.temperature,
    record.battery.soc,
    record.inverter.voltage,
    record.inverter.current,
    record.inverter.frequency,
    record.grid.voltage,
    record.grid.current,
    record.grid.frequency,
    record.status.hex,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}