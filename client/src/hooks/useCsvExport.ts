import { useMemo } from 'react';

export interface CsvExportItem {
  [key: string]: any;
}

export interface UseCsvExportOptions {
  filename?: string;
  headers?: string[];
  transform?: (item: any) => any;
}

export interface UseCsvExportReturn {
  csvData: any[];
  csvHeaders: string[];
  filename: string;
}

export function useCsvExport(
  items: CsvExportItem[],
  options: UseCsvExportOptions = {}
): UseCsvExportReturn {
  const {
    filename = `map-export-${new Date().toISOString().split('T')[0]}.csv`,
    headers,
    transform,
  } = options;

  const csvData = useMemo(() => {
    if (!items || items.length === 0) {
      return [];
    }

    if (transform) {
      return items.map(transform);
    }

    return items.map(item => ({
      ID: item.id,
      Type: item.layerId || item.type || 'Unknown',
      Title: item.data?.title || item.data?.name || 'Untitled',
      Latitude: item.lat,
      Longitude: item.lng,
      Description: item.data?.description || '',
      ...item.data,
    }));
  }, [items, transform]);

  const csvHeaders = useMemo(() => {
    if (headers) {
      return headers;
    }

    if (csvData.length === 0) {
      return [];
    }

    return Object.keys(csvData[0]);
  }, [csvData, headers]);

  return {
    csvData,
    csvHeaders,
    filename,
  };
}
