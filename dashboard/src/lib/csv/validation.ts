/**
 * Data validation utilities for CarryGreen inverter data
 */

import { ParseError } from '@/types';

/**
 * Validation rules for different data types
 */
export const ValidationRules = {
  // Voltage ranges (in volts)
  voltage: {
    min: 0,
    max: 300,
  },
  // Current ranges (in amperes)
  current: {
    min: -100,
    max: 100,
  },
  // Power ranges (in watts)
  power: {
    min: 0,
    max: 10000,
  },
  // Energy ranges (in kWh)
  energy: {
    min: 0,
    max: 100000,
  },
  // Temperature ranges (in Celsius)
  temperature: {
    min: -40,
    max: 80,
  },
  // State of Charge (percentage)
  soc: {
    min: 0,
    max: 100,
  },
  // Frequency ranges (in Hz)
  frequency: {
    min: 45,
    max: 65,
  },
} as const;

/**
 * Validates a numeric value against specified range
 */
export function validateNumber(
  value: string,
  fieldName: string,
  min: number,
  max: number,
  rowIndex: number
): { value: number; error?: ParseError } {
  // Handle empty values
  if (value === '' || value === '-' || value === null || value === undefined) {
    return { value: 0 };
  }

  const numValue = Number(value);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return {
      value: 0,
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: `Invalid number format: "${value}"`,
        type: 'conversion',
      },
    };
  }

  // Check if it's within range
  if (numValue < min || numValue > max) {
    return {
      value: numValue,
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: `Value ${numValue} is outside valid range [${min}, ${max}]`,
        type: 'validation',
      },
    };
  }

  return { value: numValue };
}

/**
 * Validates voltage values
 */
export function validateVoltage(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: number; error?: ParseError } {
  return validateNumber(
    value,
    fieldName,
    ValidationRules.voltage.min,
    ValidationRules.voltage.max,
    rowIndex
  );
}

/**
 * Validates current values
 */
export function validateCurrent(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: number; error?: ParseError } {
  return validateNumber(
    value,
    fieldName,
    ValidationRules.current.min,
    ValidationRules.current.max,
    rowIndex
  );
}

/**
 * Validates power values
 */
export function validatePower(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: number; error?: ParseError } {
  return validateNumber(
    value,
    fieldName,
    ValidationRules.power.min,
    ValidationRules.power.max,
    rowIndex
  );
}

/**
 * Validates energy values
 */
export function validateEnergy(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: number; error?: ParseError } {
  return validateNumber(
    value,
    fieldName,
    ValidationRules.energy.min,
    ValidationRules.energy.max,
    rowIndex
  );
}

/**
 * Validates temperature values
 */
export function validateTemperature(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: number; error?: ParseError } {
  return validateNumber(
    value,
    fieldName,
    ValidationRules.temperature.min,
    ValidationRules.temperature.max,
    rowIndex
  );
}

/**
 * Validates State of Charge values
 */
export function validateSOC(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: number; error?: ParseError } {
  return validateNumber(
    value,
    fieldName,
    ValidationRules.soc.min,
    ValidationRules.soc.max,
    rowIndex
  );
}

/**
 * Validates frequency values
 */
export function validateFrequency(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: number; error?: ParseError } {
  return validateNumber(
    value,
    fieldName,
    ValidationRules.frequency.min,
    ValidationRules.frequency.max,
    rowIndex
  );
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function validateDate(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: string; error?: ParseError } {
  if (!value || value === '') {
    return {
      value: '',
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: 'Date is required',
        type: 'missing',
      },
    };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return {
      value: value,
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: 'Date must be in YYYY-MM-DD format',
        type: 'format',
      },
    };
  }

  // Validate that it's a valid date
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return {
      value: value,
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: 'Invalid date',
        type: 'validation',
      },
    };
  }

  return { value: value };
}

/**
 * Validates time format (HH:MM)
 */
export function validateTime(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: string; error?: ParseError } {
  if (!value || value === '') {
    return {
      value: '',
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: 'Time is required',
        type: 'missing',
      },
    };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value)) {
    return {
      value: value,
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: 'Time must be in HH:MM format',
        type: 'format',
      },
    };
  }

  return { value: value };
}

/**
 * Validates blackout status
 */
export function validateBlackout(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: boolean | null; error?: ParseError } {
  if (value === '' || value === '-') {
    return { value: null };
  }

  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
    return { value: true };
  }
  if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
    return { value: false };
  }

  return {
    value: null,
    error: {
      row: rowIndex,
      field: fieldName,
      value: value,
      message: `Invalid blackout status: "${value}"`,
      type: 'validation',
    },
  };
}

/**
 * Validates hex status code
 */
export function validateHex(
  value: string,
  fieldName: string,
  rowIndex: number
): { value: string; error?: ParseError } {
  if (!value || value === '') {
    return { value: '0x00' };
  }

  const hexRegex = /^0x[0-9A-Fa-f]+$/;
  if (!hexRegex.test(value)) {
    return {
      value: value,
      error: {
        row: rowIndex,
        field: fieldName,
        value: value,
        message: `Invalid hex format: "${value}"`,
        type: 'format',
      },
    };
  }

  return { value: value };
}