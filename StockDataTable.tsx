import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { format, parseISO } from 'date-fns';

interface StockData {
  Date: string;
  Close: number;
  Open: number;
  High: number;
  Low: number;
  Volume: number;
  Daily_Return: number;
  Volatility_20d: number;
  RSI: number;
}

const StockDataTable = () => {
  const [data, setData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState('Date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/processed_uber_stock_data.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const parsedData = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.split(',');
          const entry: any = {};
          
          headers.forEach((header, index) => {
            if (header === 'Date') {
              entry[header] = values[index];
            } else {
              entry[header] = parseFloat(values[index]);
            }
          });
          
          return entry as StockData;
        });
        
        setData(parsedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a: any, b: any) => {
    if (sortColumn === 'Date') {
      const dateA = new Date(a[sortColumn]).getTime();
      const dateB = new Date(b[sortColumn]).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === 'asc' 
        ? a[sortColumn] - b[sortColumn] 
        : b[sortColumn] - a[sortColumn];
    }
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(data.length / rowsPerPage);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <p>Loading stock data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Uber Stock Data</CardTitle>
        <CardDescription>
          Historical price and technical indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Date')}
                >
                  Date {sortColumn === 'Date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Open')}
                >
                  Open {sortColumn === 'Open' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('High')}
                >
                  High {sortColumn === 'High' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Low')}
                >
                  Low {sortColumn === 'Low' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Close')}
                >
                  Close {sortColumn === 'Close' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Volume')}
                >
                  Volume {sortColumn === 'Volume' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Daily_Return')}
                >
                  Return (%) {sortColumn === 'Daily_Return' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('RSI')}
                >
                  RSI {sortColumn === 'RSI' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(row.Date)}</TableCell>
                  <TableCell>{formatNumber(row.Open)}</TableCell>
                  <TableCell>{formatNumber(row.High)}</TableCell>
                  <TableCell>{formatNumber(row.Low)}</TableCell>
                  <TableCell>{formatNumber(row.Close)}</TableCell>
                  <TableCell>{formatVolume(row.Volume)}</TableCell>
                  <TableCell className={row.Daily_Return >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatNumber(row.Daily_Return)}%
                  </TableCell>
                  <TableCell className={
                    row.RSI > 70 ? 'text-red-600' : 
                    row.RSI < 30 ? 'text-green-600' : 
                    'text-gray-600'
                  }>
                    {formatNumber(row.RSI)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDataTable;
