import React, { useState, useEffect } from 'react';
import dataManager from '../dataContext';

const TelemetryData = () => {
  const [processedData, setProcessedData] = useState({
    altitude: [],
    pressure: [],
    acceleration: [],
    gyroscope: [],
    temperature: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const colors = {
    AX: '#8884d8', AY: '#82ca9d', AZ: '#ffc658',
    GX: '#ff8042', GY: '#00C49F', GZ: '#FFBB28',
    Temp: '#FF8042', mX: '#0088FE', mY: '#00C49F',
    mZ: '#FFBB28', BA: '#FF8042', BP: '#8884d8', BT: '#82ca9d'
  };

  const groupInfo = {
    altitude: { title: "Altitude", description: "Altitude data" },
    acceleration: { title: "Acceleration", description: "Acceleration data" },
    gyroscope: { title: "Gyroscope", description: "Gyroscope data (RAD/ms)" },
    magneticFlux: { title: "Magnetic Flux", description: "Magnetic Flux across X,Y & Z axis" },
    temperature: { title: "Temperature", description: "Temperature data" },
    pressure: { title: "Pressure", description: "Pressure data" }
  };

  const updateFromDataManager = (manager) => {
    setLoading(manager.loading);
    setError(manager.error);
    setProcessedData(manager.processedData);
    setIsStreaming(manager.isStreaming);
  };

  useEffect(() => {
    if (dataManager.loading && dataManager.rawData.length === 0) {
      dataManager.fetchData();
    }
    const unsubscribe = dataManager.subscribe(updateFromDataManager);
    return () => {
      unsubscribe();
      dataManager.stopStreaming();
    };
  }, []);

  const resetStream = () => dataManager.resetStream();

  if (loading) return <div className="p-4 text-gray-300">Loading data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="mt-8 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Latest Sensor Values</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(processedData).map(([group, data]) => {
          if (!data.length) return null;
          const latest = data[data.length - 1];
          if (!latest) return null;
          const params = Object.keys(latest).filter(key => key !== 'time');

          return (
            <div key={group} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                {groupInfo[group]?.title || group}
              </h3>
              <div className="text-sm space-y-1">
                {params.map(param => (
                  <div key={param} className="flex justify-between">
                    <span className="font-medium text-gray-900">{param}:</span>
                    <span className="font-mono text-gray-900" style={{ color: colors[param] || '#333' }}>
                      {typeof latest[param] === 'number' ? latest[param].toFixed(4) : latest[param]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TelemetryData;
