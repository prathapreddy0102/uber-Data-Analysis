import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface SummaryStats {
  'Start Date': string;
  'End Date': string;
  'Trading Days': number;
  'Initial Price': number;
  'Final Price': number;
  'Overall Return (%)': number;
  'Annualized Return (%)': number;
  'Average Daily Return (%)': number;
  'Median Daily Return (%)': number;
  'Max Daily Gain (%)': number;
  'Max Daily Loss (%)': number;
  'Daily Return Std Dev (%)': number;
  'Positive Days (%)': number;
  'Negative Days (%)': number;
  'Average Volume': number;
  'Max Volume': number;
  'Min Volume': number;
  'Highest Price': number;
  'Lowest Price': number;
  'Price Range': number;
  'Average Volatility (20d)': number;
}

const StockSummary = () => {
  const [summaryStats, setSummaryStats] = useState<Partial<SummaryStats>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the processed data to calculate summary stats
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
          
          return entry;
        });
        
        // Sort by date
        parsedData.sort((a: any, b: any) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        
        // Calculate summary statistics
        const stats: Partial<SummaryStats> = {
          'Start Date': parsedData[0].Date,
          'End Date': parsedData[parsedData.length - 1].Date,
          'Trading Days': parsedData.length,
          'Initial Price': parsedData[0].Close,
          'Final Price': parsedData[parsedData.length - 1].Close,
          'Overall Return (%)': ((parsedData[parsedData.length - 1].Close / parsedData[0].Close) - 1) * 100,
          'Annualized Return (%)': ((parsedData[parsedData.length - 1].Close / parsedData[0].Close) ** (365 / ((new Date(parsedData[parsedData.length - 1].Date).getTime() - new Date(parsedData[0].Date).getTime()) / (1000 * 60 * 60 * 24))) - 1) * 100,
          'Average Daily Return (%)': parsedData.reduce((sum: number, item: any) => sum + item.Daily_Return, 0) / parsedData.length,
          'Median Daily Return (%)': parsedData.map((item: any) => item.Daily_Return).sort((a: number, b: number) => a - b)[Math.floor(parsedData.length / 2)],
          'Max Daily Gain (%)': Math.max(...parsedData.map((item: any) => item.Daily_Return)),
          'Max Daily Loss (%)': Math.min(...parsedData.map((item: any) => item.Daily_Return)),
          'Daily Return Std Dev (%)': Math.sqrt(parsedData.reduce((sum: number, item: any) => sum + Math.pow(item.Daily_Return - (parsedData.reduce((s: number, i: any) => s + i.Daily_Return, 0) / parsedData.length), 2), 0) / parsedData.length),
          'Positive Days (%)': (parsedData.filter((item: any) => item.Daily_Return > 0).length / parsedData.length) * 100,
          'Negative Days (%)': (parsedData.filter((item: any) => item.Daily_Return < 0).length / parsedData.length) * 100,
          'Average Volume': parsedData.reduce((sum: number, item: any) => sum + item.Volume, 0) / parsedData.length,
          'Max Volume': Math.max(...parsedData.map((item: any) => item.Volume)),
          'Min Volume': Math.min(...parsedData.map((item: any) => item.Volume)),
          'Highest Price': Math.max(...parsedData.map((item: any) => item.High)),
          'Lowest Price': Math.min(...parsedData.map((item: any) => item.Low)),
          'Price Range': Math.max(...parsedData.map((item: any) => item.High)) - Math.min(...parsedData.map((item: any) => item.Low)),
          'Average Volatility (20d)': parsedData.reduce((sum: number, item: any) => sum + (item.Volatility_20d || 0), 0) / parsedData.filter((item: any) => item.Volatility_20d).length,
        };
        
        setSummaryStats(stats);
      } catch (error) {
        console.error('Error calculating summary statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummaryStats();
  }, []);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatVolume = (volume: number | undefined) => {
    if (volume === undefined) return 'N/A';
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <p>Loading summary statistics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Uber Stock Summary</CardTitle>
        <CardDescription>
          Key performance metrics and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="volatility">Volatility</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Time Period</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="text-sm font-medium">{formatDate(summaryStats['Start Date'])}</div>
                  
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="text-sm font-medium">{formatDate(summaryStats['End Date'])}</div>
                  
                  <div className="text-sm text-gray-500">Trading Days</div>
                  <div className="text-sm font-medium">{summaryStats['Trading Days']}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Price Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Initial Price</div>
                  <div className="text-sm font-medium">${formatNumber(summaryStats['Initial Price'])}</div>
                  
                  <div className="text-sm text-gray-500">Final Price</div>
                  <div className="text-sm font-medium">${formatNumber(summaryStats['Final Price'])}</div>
                  
                  <div className="text-sm text-gray-500">Highest Price</div>
                  <div className="text-sm font-medium">${formatNumber(summaryStats['Highest Price'])}</div>
                  
                  <div className="text-sm text-gray-500">Lowest Price</div>
                  <div className="text-sm font-medium">${formatNumber(summaryStats['Lowest Price'])}</div>
                  
                  <div className="text-sm text-gray-500">Price Range</div>
                  <div className="text-sm font-medium">${formatNumber(summaryStats['Price Range'])}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="returns">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Overall Performance</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Overall Return</div>
                  <div className={`text-sm font-medium ${(summaryStats['Overall Return (%)'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(summaryStats['Overall Return (%)'])}%
                  </div>
                  
                  <div className="text-sm text-gray-500">Annualized Return</div>
                  <div className={`text-sm font-medium ${(summaryStats['Annualized Return (%)'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(summaryStats['Annualized Return (%)'])}%
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Daily Returns</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Average Daily Return</div>
                  <div className={`text-sm font-medium ${(summaryStats['Average Daily Return (%)'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(summaryStats['Average Daily Return (%)'])}%
                  </div>
                  
                  <div className="text-sm text-gray-500">Median Daily Return</div>
                  <div className={`text-sm font-medium ${(summaryStats['Median Daily Return (%)'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(summaryStats['Median Daily Return (%)'])}%
                  </div>
                  
                  <div className="text-sm text-gray-500">Max Daily Gain</div>
                  <div className="text-sm font-medium text-green-600">
                    {formatNumber(summaryStats['Max Daily Gain (%)'])}%
                  </div>
                  
                  <div className="text-sm text-gray-500">Max Daily Loss</div>
                  <div className="text-sm font-medium text-red-600">
                    {formatNumber(summaryStats['Max Daily Loss (%)'])}%
                  </div>
                  
                  <div className="text-sm text-gray-500">Positive Days</div>
                  <div className="text-sm font-medium">
                    {formatNumber(summaryStats['Positive Days (%)'])}%
                  </div>
                  
                  <div className="text-sm text-gray-500">Negative Days</div>
                  <div className="text-sm font-medium">
                    {formatNumber(summaryStats['Negative Days (%)'])}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="volatility">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Volatility Metrics</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Daily Return Std Dev</div>
                  <div className="text-sm font-medium">
                    {formatNumber(summaryStats['Daily Return Std Dev (%)'])}%
                  </div>
                  
                  <div className="text-sm text-gray-500">Average 20-Day Volatility</div>
                  <div className="text-sm font-medium">
                    {formatNumber(summaryStats['Average Volatility (20d)'])}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Volume Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Average Volume</div>
                  <div className="text-sm font-medium">
                    {formatVolume(summaryStats['Average Volume'])}
                  </div>
                  
                  <div className="text-sm text-gray-500">Max Volume</div>
                  <div className="text-sm font-medium">
                    {formatVolume(summaryStats['Max Volume'])}
                  </div>
                  
                  <div className="text-sm text-gray-500">Min Volume</div>
                  <div className="text-sm font-medium">
                    {formatVolume(summaryStats['Min Volume'])}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StockSummary;
