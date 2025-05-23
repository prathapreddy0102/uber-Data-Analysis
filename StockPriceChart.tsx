import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Brush, ReferenceLine, Area, ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { format, parseISO } from 'date-fns';

interface StockData {
  Date: string;
  Close: number;
  Open: number;
  High: number;
  Low: number;
  Volume: number;
  Daily_Return: number;
  MA_50: number;
  MA_200: number;
  RSI: number;
  MACD: number;
  MACD_Signal: number;
  MACD_Histogram: number;
  BB_Upper: number;
  BB_Middle: number;
  BB_Lower: number;
  Volatility_20d: number;
}

const StockPriceChart = () => {
  const [data, setData] = useState<StockData[]>([]);
  const [timeRange, setTimeRange] = useState('1y');
  const [isLoading, setIsLoading] = useState(true);
  // State is managed by Tabs component
  const [_, setChartType] = useState('price');

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
        
        // Sort by date
        parsedData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        
        setData(parsedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getFilteredData = () => {
    if (data.length === 0) return [];
    
    const now = new Date(data[data.length - 1].Date);
    let startDate = new Date(now);
    
    switch (timeRange) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '3y':
        startDate.setFullYear(now.getFullYear() - 3);
        break;
      case 'all':
        return data;
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }
    
    return data.filter(item => new Date(item.Date) >= startDate);
  };

  const filteredData = getFilteredData();
  
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-bold">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Volume' ? formatVolume(entry.value) : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <CardContent>
          <p>Loading stock data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Uber Stock Performance</CardTitle>
            <CardDescription>
              Historical price and technical indicators
            </CardDescription>
          </div>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="3y">3 Years</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="price" onValueChange={setChartType}>
          <TabsList className="mb-4">
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="candlestick">OHLC</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="bollinger">Bollinger Bands</TabsTrigger>
          </TabsList>
          
          <TabsContent value="price" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                  minTickGap={30}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Close" stroke="#8884d8" dot={false} name="Price" />
                <Line type="monotone" dataKey="MA_50" stroke="#82ca9d" dot={false} name="50-day MA" />
                <Line type="monotone" dataKey="MA_200" stroke="#ff7300" dot={false} name="200-day MA" />
                <Brush dataKey="Date" height={30} stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="candlestick" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                  minTickGap={30}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {filteredData.map((entry, index) => (
                  <ReferenceLine
                    key={`line-${index}`}
                    segment={[
                      { x: entry.Date, y: entry.Low },
                      { x: entry.Date, y: entry.High }
                    ]}
                    stroke={entry.Close >= entry.Open ? "#4CAF50" : "#FF5252"}
                    strokeWidth={1}
                  />
                ))}
                {filteredData.map((entry, index) => (
                  <ReferenceLine
                    key={`bar-${index}`}
                    segment={[
                      { x: entry.Date, y: entry.Open },
                      { x: entry.Date, y: entry.Close }
                    ]}
                    stroke={entry.Close >= entry.Open ? "#4CAF50" : "#FF5252"}
                    strokeWidth={8}
                  />
                ))}
                <Brush dataKey="Date" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="volume" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                  minTickGap={30}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="Volume" 
                  fill="#8884d8" 
                  stroke="#8884d8"
                  name="Volume"
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="Close" 
                  stroke="#ff7300" 
                  dot={false}
                  name="Price"
                />
                <Brush dataKey="Date" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="returns" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                  minTickGap={30}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Daily_Return" stroke="#8884d8" name="Daily Return (%)" />
                <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                <Brush dataKey="Date" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="indicators" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                  minTickGap={30}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="MACD" stroke="#8884d8" dot={false} name="MACD" />
                <Line yAxisId="left" type="monotone" dataKey="MACD_Signal" stroke="#82ca9d" dot={false} name="Signal" />
                <Line yAxisId="right" type="monotone" dataKey="RSI" stroke="#ff7300" dot={false} name="RSI" />
                <ReferenceLine yAxisId="right" y={70} stroke="red" strokeDasharray="3 3" />
                <ReferenceLine yAxisId="right" y={30} stroke="green" strokeDasharray="3 3" />
                <Brush dataKey="Date" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="bollinger" className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                  minTickGap={30}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Close" stroke="#8884d8" dot={false} name="Price" />
                <Line type="monotone" dataKey="BB_Upper" stroke="#82ca9d" dot={false} name="Upper Band" />
                <Line type="monotone" dataKey="BB_Middle" stroke="#ff7300" dot={false} name="Middle Band" />
                <Line type="monotone" dataKey="BB_Lower" stroke="#82ca9d" dot={false} name="Lower Band" />
                <Brush dataKey="Date" height={30} stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StockPriceChart;
