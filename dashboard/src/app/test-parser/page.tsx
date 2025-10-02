'use client';

import { useState } from 'react';
import { parseCSV, formatParseErrors } from '@/lib/csv';
import { ParseResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestParserPage() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const content = await file.text();
      const result = await parseCSV(content);
      setParseResult(result);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setParseResult({
        data: [],
        errors: [{
          row: 0,
          field: 'file',
          value: file.name,
          message: 'Failed to parse file',
          type: 'format',
        }],
        totalRows: 0,
        successfulRows: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd fetch this from an API or static file
      // For now, we'll just create some sample CSV content
      const sampleCSV = `User Record,,,,Inv Supply,,PV,,,,,,,BATTERY,,,,INVERTER,,,GRID,,,Status
ID,Date,Time,Name,Blackout,Total kWh,Voltage,Current,Power W,Daily Wh,Monthly Wd,Yearly Wm,Total kWh,Voltage,Current,Temp,SOC,Voltage,Current,Hz,Voltage,Current,Hz,Hex
HINV-80F3DA61D0,2025-09-28,21:05,TwinklePower,-,1.85,0,0,0,0,774.77,387.38,2.32,25.9,0,27,98,208.35,0,60,206.63,0,60,0x03
,,21:06,,-,,0,0,0,,,,,25.9,0,27,98,208.09,0,60,206.63,0,60,0x03`;

      const result = await parseCSV(sampleCSV);
      setParseResult(result);
    } catch (error) {
      console.error('Error parsing sample CSV:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV Parser Test</CardTitle>
          <CardDescription>
            Test the CarryGreen CSV parser with sample data or upload your own file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={loadSampleData} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load Sample Data'}
            </Button>
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>

          {parseResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-primary">{parseResult.totalRows}</div>
                    <p className="text-xs text-muted-foreground">Total Rows</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{parseResult.successfulRows}</div>
                    <p className="text-xs text-muted-foreground">Successful</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{parseResult.errors.length}</div>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {parseResult.successfulRows > 0 ? Math.round((parseResult.successfulRows / parseResult.totalRows) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </CardContent>
                </Card>
              </div>

              {parseResult.errors.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <div className="whitespace-pre-wrap text-sm">
                      {formatParseErrors(parseResult.errors.slice(0, 10))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {parseResult.data.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Parsed Data</CardTitle>
                    <CardDescription>First few records from the parsed data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <pre className="text-xs bg-muted p-4 rounded">
                        {JSON.stringify(parseResult.data.slice(0, 2), null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}