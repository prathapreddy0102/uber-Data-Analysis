import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os

# Set the style for plots
plt.style.use('fivethirtyeight')
sns.set_palette("deep")
plt.rcParams['figure.figsize'] = [12, 7]
plt.rcParams['figure.dpi'] = 100

# Create output directory for plots
os.makedirs('analysis_results', exist_ok=True)

# Load the data
df = pd.read_csv('upload/uber_stock_data.csv')

# Convert Date to datetime
df['Date'] = pd.to_datetime(df['Date'])

# Sort by date (ensure chronological order)
df = df.sort_values('Date')

# Create analysis directory
os.makedirs('analysis_results/data', exist_ok=True)

# Calculate daily returns
df['Daily_Return'] = df['Close'].pct_change() * 100
df['Daily_Return'].fillna(0, inplace=True)

# Calculate cumulative returns
df['Cumulative_Return'] = (1 + df['Daily_Return']/100).cumprod() - 1

# Calculate volatility (20-day rolling standard deviation of returns)
df['Volatility_20d'] = df['Daily_Return'].rolling(window=20).std()

# Calculate moving averages
df['MA_50'] = df['Close'].rolling(window=50).mean()
df['MA_200'] = df['Close'].rolling(window=200).mean()

# Calculate MACD
df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
df['MACD'] = df['EMA_12'] - df['EMA_26']
df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
df['MACD_Histogram'] = df['MACD'] - df['MACD_Signal']

# Calculate RSI
delta = df['Close'].diff()
gain = delta.where(delta > 0, 0)
loss = -delta.where(delta < 0, 0)
avg_gain = gain.rolling(window=14).mean()
avg_loss = loss.rolling(window=14).mean()
rs = avg_gain / avg_loss
df['RSI'] = 100 - (100 / (1 + rs))

# Calculate Bollinger Bands
df['BB_Middle'] = df['Close'].rolling(window=20).mean()
df['BB_Std'] = df['Close'].rolling(window=20).std()
df['BB_Upper'] = df['BB_Middle'] + 2 * df['BB_Std']
df['BB_Lower'] = df['BB_Middle'] - 2 * df['BB_Std']

# Calculate Average True Range (ATR)
df['TR'] = np.maximum(
    np.maximum(
        df['High'] - df['Low'],
        abs(df['High'] - df['Close'].shift(1))
    ),
    abs(df['Low'] - df['Close'].shift(1))
)
df['ATR'] = df['TR'].rolling(window=14).mean()

# Calculate Volume Moving Average
df['Volume_MA_20'] = df['Volume'].rolling(window=20).mean()

# Calculate price momentum
df['Momentum_14d'] = df['Close'] - df['Close'].shift(14)

# Save processed data
df.to_csv('analysis_results/data/processed_uber_stock_data.csv', index=False)

# Create summary statistics
summary_stats = {
    'Start Date': df['Date'].min().strftime('%Y-%m-%d'),
    'End Date': df['Date'].max().strftime('%Y-%m-%d'),
    'Trading Days': len(df),
    'Initial Price': df['Close'].iloc[0],
    'Final Price': df['Close'].iloc[-1],
    'Overall Return (%)': ((df['Close'].iloc[-1] / df['Close'].iloc[0]) - 1) * 100,
    'Annualized Return (%)': ((df['Close'].iloc[-1] / df['Close'].iloc[0]) ** (365 / (df['Date'].iloc[-1] - df['Date'].iloc[0]).days) - 1) * 100,
    'Average Daily Return (%)': df['Daily_Return'].mean(),
    'Median Daily Return (%)': df['Daily_Return'].median(),
    'Max Daily Gain (%)': df['Daily_Return'].max(),
    'Max Daily Loss (%)': df['Daily_Return'].min(),
    'Daily Return Std Dev (%)': df['Daily_Return'].std(),
    'Positive Days (%)': (df['Daily_Return'] > 0).mean() * 100,
    'Negative Days (%)': (df['Daily_Return'] < 0).mean() * 100,
    'Average Volume': df['Volume'].mean(),
    'Max Volume': df['Volume'].max(),
    'Min Volume': df['Volume'].min(),
    'Highest Price': df['High'].max(),
    'Lowest Price': df['Low'].min(),
    'Price Range': df['High'].max() - df['Low'].min(),
    'Average Volatility (20d)': df['Volatility_20d'].mean(),
}

# Save summary statistics
with open('analysis_results/summary_statistics.txt', 'w') as f:
    f.write("Uber Stock Analysis Summary Statistics\n")
    f.write("=====================================\n\n")
    for key, value in summary_stats.items():
        if isinstance(value, float):
            f.write(f"{key}: {value:.2f}\n")
        else:
            f.write(f"{key}: {value}\n")

# Generate plots
os.makedirs('analysis_results/plots', exist_ok=True)

# 1. Price History
plt.figure(figsize=(14, 7))
plt.plot(df['Date'], df['Close'], label='Close Price')
plt.plot(df['Date'], df['MA_50'], label='50-day MA', alpha=0.7)
plt.plot(df['Date'], df['MA_200'], label='200-day MA', alpha=0.7)
plt.title('Uber Stock Price History with Moving Averages')
plt.xlabel('Date')
plt.ylabel('Price (USD)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/price_history.png')
plt.close()

# 2. Daily Returns
plt.figure(figsize=(14, 7))
plt.plot(df['Date'], df['Daily_Return'], label='Daily Returns', alpha=0.7)
plt.axhline(y=0, color='r', linestyle='-', alpha=0.3)
plt.title('Uber Stock Daily Returns')
plt.xlabel('Date')
plt.ylabel('Daily Return (%)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/daily_returns.png')
plt.close()

# 3. Cumulative Returns
plt.figure(figsize=(14, 7))
plt.plot(df['Date'], df['Cumulative_Return'] * 100)
plt.title('Uber Stock Cumulative Returns')
plt.xlabel('Date')
plt.ylabel('Cumulative Return (%)')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/cumulative_returns.png')
plt.close()

# 4. Volatility
plt.figure(figsize=(14, 7))
plt.plot(df['Date'], df['Volatility_20d'])
plt.title('Uber Stock 20-Day Volatility')
plt.xlabel('Date')
plt.ylabel('Volatility (Std Dev of Daily Returns)')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/volatility.png')
plt.close()

# 5. Volume Analysis
plt.figure(figsize=(14, 7))
plt.bar(df['Date'], df['Volume'], alpha=0.5)
plt.plot(df['Date'], df['Volume_MA_20'], color='red', label='20-day MA')
plt.title('Uber Stock Trading Volume')
plt.xlabel('Date')
plt.ylabel('Volume')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/volume.png')
plt.close()

# 6. MACD
plt.figure(figsize=(14, 7))
plt.plot(df['Date'], df['MACD'], label='MACD')
plt.plot(df['Date'], df['MACD_Signal'], label='Signal Line')
plt.bar(df['Date'], df['MACD_Histogram'], alpha=0.5, label='Histogram')
plt.title('Uber Stock MACD')
plt.xlabel('Date')
plt.ylabel('MACD')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/macd.png')
plt.close()

# 7. RSI
plt.figure(figsize=(14, 7))
plt.plot(df['Date'], df['RSI'])
plt.axhline(y=70, color='r', linestyle='-', alpha=0.3)
plt.axhline(y=30, color='g', linestyle='-', alpha=0.3)
plt.title('Uber Stock RSI')
plt.xlabel('Date')
plt.ylabel('RSI')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/rsi.png')
plt.close()

# 8. Bollinger Bands
plt.figure(figsize=(14, 7))
plt.plot(df['Date'], df['Close'], label='Close Price')
plt.plot(df['Date'], df['BB_Middle'], label='20-day MA')
plt.plot(df['Date'], df['BB_Upper'], label='Upper Band')
plt.plot(df['Date'], df['BB_Lower'], label='Lower Band')
plt.fill_between(df['Date'], df['BB_Upper'], df['BB_Lower'], alpha=0.1)
plt.title('Uber Stock Bollinger Bands')
plt.xlabel('Date')
plt.ylabel('Price (USD)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/bollinger_bands.png')
plt.close()

# 9. Price vs Volume
plt.figure(figsize=(14, 7))
plt.subplot(2, 1, 1)
plt.plot(df['Date'], df['Close'], label='Close Price')
plt.title('Uber Stock Price')
plt.ylabel('Price (USD)')
plt.grid(True, alpha=0.3)
plt.legend()

plt.subplot(2, 1, 2)
plt.bar(df['Date'], df['Volume'], alpha=0.5)
plt.title('Uber Stock Volume')
plt.xlabel('Date')
plt.ylabel('Volume')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/price_vs_volume.png')
plt.close()

# 10. Return Distribution
plt.figure(figsize=(14, 7))
sns.histplot(df['Daily_Return'], kde=True, bins=50)
plt.title('Uber Stock Daily Return Distribution')
plt.xlabel('Daily Return (%)')
plt.ylabel('Frequency')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/return_distribution.png')
plt.close()

# 11. Correlation Matrix
correlation_columns = ['Close', 'Volume', 'Daily_Return', 'Volatility_20d', 'RSI', 'MACD']
correlation_matrix = df[correlation_columns].corr()

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', linewidths=0.5)
plt.title('Correlation Matrix of Uber Stock Metrics')
plt.tight_layout()
plt.savefig('analysis_results/plots/correlation_matrix.png')
plt.close()

# 12. Candlestick Chart (last 90 days)
last_90_days = df.tail(90).copy()

plt.figure(figsize=(14, 7))
plt.plot(last_90_days['Date'], last_90_days['Close'], label='Close Price')
plt.plot(last_90_days['Date'], last_90_days['MA_50'].tail(90), label='50-day MA', alpha=0.7)
plt.title('Uber Stock Price (Last 90 Days)')
plt.xlabel('Date')
plt.ylabel('Price (USD)')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/last_90_days.png')
plt.close()

# 13. Yearly Performance
df['Year'] = df['Date'].dt.year
yearly_returns = df.groupby('Year')['Daily_Return'].sum()

plt.figure(figsize=(12, 6))
yearly_returns.plot(kind='bar')
plt.title('Uber Stock Yearly Performance')
plt.xlabel('Year')
plt.ylabel('Yearly Return (%)')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('analysis_results/plots/yearly_performance.png')
plt.close()

# 14. Monthly Performance Heatmap
df['Month'] = df['Date'].dt.month
df['Year'] = df['Date'].dt.year
monthly_returns = df.groupby(['Year', 'Month'])['Daily_Return'].sum().unstack()

plt.figure(figsize=(12, 8))
sns.heatmap(monthly_returns, annot=True, fmt=".1f", cmap="RdYlGn", linewidths=0.5)
plt.title('Uber Stock Monthly Returns (%)')
plt.xlabel('Month')
plt.ylabel('Year')
plt.tight_layout()
plt.savefig('analysis_results/plots/monthly_heatmap.png')
plt.close()

print("Analysis completed successfully. Results saved in 'analysis_results' directory.")
