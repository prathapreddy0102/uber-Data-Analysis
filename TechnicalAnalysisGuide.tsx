import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const TechnicalAnalysisGuide = () => {
  const [activeTab, setActiveTab] = useState('moving-averages');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Technical Analysis Guide</CardTitle>
        <CardDescription>
          Understanding key technical indicators and their interpretation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="moving-averages">Moving Averages</TabsTrigger>
            <TabsTrigger value="macd">MACD</TabsTrigger>
            <TabsTrigger value="rsi">RSI</TabsTrigger>
            <TabsTrigger value="bollinger">Bollinger Bands</TabsTrigger>
          </TabsList>
          
          <TabsContent value="moving-averages">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Moving Averages</h3>
                <p className="text-gray-700">
                  Moving averages smooth out price data to create a single flowing line, making it easier to identify the direction of the trend.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">50-Day Moving Average</h4>
                  <p className="text-sm text-gray-600">
                    The 50-day moving average is a medium-term trend indicator. When the price crosses above the 50-day MA, it can signal a bullish trend. When it crosses below, it may indicate a bearish trend.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">200-Day Moving Average</h4>
                  <p className="text-sm text-gray-600">
                    The 200-day moving average is a long-term trend indicator. The relationship between the 50-day and 200-day MAs can signal major trend changes. A "golden cross" occurs when the 50-day crosses above the 200-day (bullish), while a "death cross" happens when the 50-day crosses below the 200-day (bearish).
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">How to Use Moving Averages</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Trend Identification:</strong> When price is above the MA, the trend is up; when below, the trend is down.
                  </li>
                  <li>
                    <strong>Support and Resistance:</strong> MAs often act as dynamic support (in uptrends) or resistance (in downtrends).
                  </li>
                  <li>
                    <strong>Crossovers:</strong> When a shorter-term MA crosses above a longer-term MA, it can signal a bullish trend change.
                  </li>
                </ul>
              </div>
              
              <div className="mt-4">
                <img src="/plots/price_history.png" alt="Moving Averages Example" className="rounded-md shadow-md w-full" />
                <p className="text-xs text-gray-500 mt-1">Example of Uber stock price with 50-day and 200-day moving averages</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="macd">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">MACD (Moving Average Convergence Divergence)</h3>
                <p className="text-gray-700">
                  MACD is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Components</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>MACD Line:</strong> The difference between the 12-period and 26-period EMAs</li>
                    <li><strong>Signal Line:</strong> 9-period EMA of the MACD Line</li>
                    <li><strong>Histogram:</strong> The difference between the MACD Line and Signal Line</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Interpretation</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>Bullish Signal:</strong> MACD Line crosses above Signal Line</li>
                    <li><strong>Bearish Signal:</strong> MACD Line crosses below Signal Line</li>
                    <li><strong>Divergence:</strong> When MACD diverges from price, it can signal potential reversals</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">How to Use MACD</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Crossovers:</strong> The MACD crossing above the signal line is bullish, while crossing below is bearish.
                  </li>
                  <li>
                    <strong>Divergence:</strong> When the MACD forms highs or lows that diverge from the corresponding highs and lows in the price, it can signal the end of the current trend.
                  </li>
                  <li>
                    <strong>Histogram:</strong> The histogram represents the difference between MACD and its signal line. When the histogram is positive and increasing, bullish momentum is increasing.
                  </li>
                </ul>
              </div>
              
              <div className="mt-4">
                <img src="/plots/macd.png" alt="MACD Example" className="rounded-md shadow-md w-full" />
                <p className="text-xs text-gray-500 mt-1">Example of MACD indicator for Uber stock</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rsi">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">RSI (Relative Strength Index)</h3>
                <p className="text-gray-700">
                  RSI is a momentum oscillator that measures the speed and change of price movements on a scale from 0 to 100.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Key Levels</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>Overbought:</strong> RSI above 70 indicates potential overbought conditions</li>
                    <li><strong>Oversold:</strong> RSI below 30 indicates potential oversold conditions</li>
                    <li><strong>Centerline:</strong> RSI at 50 can indicate neutral momentum</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Signals</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>Overbought Reversal:</strong> When RSI moves back below 70 from above</li>
                    <li><strong>Oversold Reversal:</strong> When RSI moves back above 30 from below</li>
                    <li><strong>Divergence:</strong> When RSI trend differs from price trend</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">How to Use RSI</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Overbought/Oversold:</strong> Traditional interpretation suggests that RSI values of 70 or above indicate overbought conditions (potential sell signal), while RSI values of 30 or below indicate oversold conditions (potential buy signal).
                  </li>
                  <li>
                    <strong>Divergence:</strong> When price makes a new high but RSI fails to exceed its previous high, this bearish divergence can signal a potential reversal. Conversely, bullish divergence occurs when price makes a new low but RSI doesn't.
                  </li>
                  <li>
                    <strong>Failure Swings:</strong> These are reversal signals that occur when RSI crosses back above 30 (bullish) or back below 70 (bearish).
                  </li>
                </ul>
              </div>
              
              <div className="mt-4">
                <img src="/plots/rsi.png" alt="RSI Example" className="rounded-md shadow-md w-full" />
                <p className="text-xs text-gray-500 mt-1">Example of RSI indicator for Uber stock with 30/70 threshold lines</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bollinger">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Bollinger Bands</h3>
                <p className="text-gray-700">
                  Bollinger Bands are volatility bands placed above and below a moving average, helping to visualize whether prices are high or low on a relative basis.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Components</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>Middle Band:</strong> 20-period simple moving average (SMA)</li>
                    <li><strong>Upper Band:</strong> Middle Band + (2 × 20-period standard deviation)</li>
                    <li><strong>Lower Band:</strong> Middle Band - (2 × 20-period standard deviation)</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Signals</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>Squeeze:</strong> When bands contract, volatility is decreasing</li>
                    <li><strong>Expansion:</strong> When bands widen, volatility is increasing</li>
                    <li><strong>Breakouts:</strong> Price moving outside the bands can signal continuation</li>
                    <li><strong>Mean Reversion:</strong> Price tends to return to the middle band</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">How to Use Bollinger Bands</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Volatility Measurement:</strong> The width of the bands represents market volatility. Wider bands indicate higher volatility, while narrower bands suggest lower volatility.
                  </li>
                  <li>
                    <strong>Trend Strength:</strong> When price consistently touches or exceeds one band, it can indicate a strong trend in that direction.
                  </li>
                  <li>
                    <strong>Reversals:</strong> When price touches or exceeds a band and then moves back toward the middle band, it can signal a potential reversal.
                  </li>
                  <li>
                    <strong>Bollinger Band Squeeze:</strong> When the bands contract significantly (low volatility), it often precedes a period of high volatility and potential breakout.
                  </li>
                </ul>
              </div>
              
              <div className="mt-4">
                <img src="/plots/bollinger_bands.png" alt="Bollinger Bands Example" className="rounded-md shadow-md w-full" />
                <p className="text-xs text-gray-500 mt-1">Example of Bollinger Bands for Uber stock</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TechnicalAnalysisGuide;
