import Papa from 'papaparse';

class DataManager {
  constructor() {
    this.rawData = [];
    this.processedData = {
      altitude: [],
      accelerationX: [],
      accelerationY: [],
      accelerationZ: [],
      gyroscope: [],
      temperature: [],
      magneticFlux: [],
      pressure: []
    };
    this.loading = true;
    this.error = null;
    this.listeners = [];
    this.currentIndex = 0;
    this.streamInterval = null;
    this.isStreaming = false;
    
    // Parameter configurations
    this.paramConfig = {
      // Define parameter groups and their update intervals
      AX: { group: 'accelerationX', interval: 100 },
      AY: { group: 'accelerationY', interval: 100 },
      AZ: { group: 'accelerationZ', interval: 100 },
      GX: { group: 'gyroscope', interval: 100 },
      GY: { group: 'gyroscope', interval: 100 },
      GZ: { group: 'gyroscope', interval: 100 },
      BA: { group: 'altitude', interval: 200 },
      BT: { group: 'temperature', interval: 100 },
      BP: { group: 'pressure', interval: 100 },
      Temp: { group: 'temperature', interval: 100 },
      mX: { group: 'magneticFlux', interval: 200 },
      mY: { group: 'magneticFlux', interval: 200 },
      mZ: { group: 'magneticFlux', interval: 200 }
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const data = {
      processedData: this.getProcessedData(),
      rawData: this.rawData,
      loading: this.loading,
      error: this.error,
      isStreaming: this.isStreaming,
      currentIndex: this.currentIndex,
      totalPoints: this.rawData.length
    };
    
    this.listeners.forEach(listener => listener(data));
  }

  async fetchData(url = '/phase1.csv') {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          this.rawData = results.data.filter(row => 
            row.time !== null && 
            !isNaN(row.time) && 
            Object.keys(row).length > 1
          );
          this.loading = false;
          this.currentIndex = 0;
          this.notifyListeners();
        },
        error: (error) => {
          this.error = 'Error parsing CSV: ' + error.message;
          this.loading = false;
          this.notifyListeners();
        }
      });
    } catch (err) {
      this.error = 'Error fetching CSV: ' + err.message;
      this.loading = false;
      this.notifyListeners();
    }
  }

  getAvailableParameters() {
    if (!this.rawData.length) return [];
    return Object.keys(this.rawData[0]).filter(key => key !== 'time');
  }

  getProcessedData() {
    if (!this.rawData.length) return this.processedData;
    
    // Initialize result object with empty arrays for each data group
    const result = Object.keys(this.processedData).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    
    // Get the current slice of raw data
    const currentData = this.rawData.slice(0, this.currentIndex + 1);
    const params = this.getAvailableParameters();
    
    // Process each data point
    currentData.forEach(row => {
      const time = row.time;
      
      // Sort parameters into their appropriate groups
      params.forEach(param => {
        if (this.paramConfig[param]) {
          const { group } = this.paramConfig[param];
          
          // Find or create an entry for this timestamp
          let entry = result[group].find(item => item.time === time);
          
          if (!entry) {
            entry = { time };
            result[group].push(entry);
          }
          
          // Add the parameter value to the entry
          entry[param] = row[param];
        }
      });
    });
    
    // Sort each group by time
    Object.keys(result).forEach(group => {
      result[group].sort((a, b) => a.time - b.time);
    });
    
    return result;
  }

  // Streaming control methods
  startStreaming() {
    if (this.isStreaming) return;
    
    this.isStreaming = true;
    
    this.streamInterval = setInterval(() => {
      if (this.currentIndex < this.rawData.length - 1) {
        this.currentIndex++;
        this.notifyListeners();
      } else {
        this.stopStreaming();
      }
    }, 10);
    
    this.notifyListeners();
  }

  stopStreaming() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
    
    this.isStreaming = false;
    this.notifyListeners();
  }

  resetStream() {
    this.stopStreaming();
    this.currentIndex = 0;
    this.notifyListeners();
  }
}

// Create and export a singleton instance
const dataManager = new DataManager();
export default dataManager;


export const groupInfo = {
  altitude: { 
    title: "Altitude", 
    description: "Altitude data",
    unit: "meters",
    icon: "📊",
    yMin: 90,
    yMax: 395

  },
  accelerationX: { 
    title: "Acceleration X", 
    description: "Acceleration in X-axis",
    unit: "m/s²",
    icon: "➡️",
    yMin: -154,
    yMax: 120
  },
  accelerationY: { 
    title: "Acceleration Y", 
    description: "Acceleration in Y-axis",
    unit: "m/s²",
    icon: "⬆️",
    yMin: -22,
    yMax: 44
  },
  accelerationZ: { 
    title: "Acceleration Z", 
    description: "Acceleration in Z-axis",
    unit: "m/s²",
    icon: "↗️",
    yMin: -97,
    yMax: 48
  },
  gyroscope: { 
    title: "Gyroscope", 
    description: "Gyroscope data",
    unit: "RAD/ms",
    icon: "🔄",
    yMin: -20,
    yMax: 11
  },
  temperature: { 
    title: "Temperature", 
    description: "Temperature data",
    unit: "°C",
    icon: "🌡️",
    yMin: 15,
    yMax: 16
  },
  magneticFlux: { 
    title: "Magnetic Flux", 
    description: "Magnetic Flux across X, Y & Z axis",
    unit: "μT",
    icon: "🧲",
    yMin: -107,
    yMax: 104
  },
  pressure: { 
    title: "Pressure", 
    description: "Pressure data",
    unit: "hPa",
    icon: "📉",
    yMin: 963,
    yMax: 998
  }
};




export const colors = {
  AX: '#4dabf7', AY: '#63e6be', AZ: '#ffd43b',
  GX: '#ff8787', GY: '#20c997', GZ: '#fcc419',
  Temp: '#ff6b6b', mX: '#4c6ef5', mY: '#38d9a9', mZ: '#fab005',
  BA: '#f06595', BP: '#7950f2', BT: '#12b886'
};
