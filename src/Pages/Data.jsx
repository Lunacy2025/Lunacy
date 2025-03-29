import React, { useState, useEffect } from 'react';
import dataManager from '../dataContext';
import GraphContainer, { ExpandedGraphModal } from '../Components/Graph';
import TelemetryData from '../sections/TelemeteryData';
import Title from '../sections/Title';
import { RefreshCw, Pause, Play,Puzzle } from 'lucide-react';
import CameraDetection from './CameraDetection';
import { groupInfo } from '../dataContext';
import colors from '../dataContext';

const Data = () => {
  const [dataState, setDataState] = useState({
    processedData: {},
    loading: true,
    error: null,
    isStreaming: false,
  });
  
  const [expandedGraph, setExpandedGraph] = useState(null);
  
  useEffect(() => {
    const updateState = (manager) => {
      setDataState({
        processedData: manager.processedData,
        loading: manager.loading,
        error: manager.error,
        isStreaming: manager.isStreaming,
      });
    };

    const unsubscribe = dataManager.subscribe(updateState);
    if (!dataManager.rawData.length) dataManager.fetchData();
    return () => unsubscribe();
  }, []);

  const { processedData, loading, error, isStreaming } = dataState;
  
  const toggleStreaming = () => isStreaming ? dataManager.stopStreaming() : dataManager.startStreaming();
  
  const handleExpandGraph = (groupKey) => {
    setExpandedGraph(expandedGraph === groupKey ? null : groupKey);
  };
  
  const handleRefreshData = () => {
    dataManager.fetchData();
  };
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <RefreshCw size={40} className="mx-auto text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-300">Loading telemetry data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md text-center">
          <div className="mb-4 text-red-400 text-4xl">⚠️</div>
          <h3 className="text-xl font-medium text-red-400 mb-2">Error Loading Data</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button onClick={handleRefreshData}className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto">
            <RefreshCw size={16} className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-300 p-4 overflow-x-hidden">
      {/* Render expanded graph modal from the imported component */}
      <ExpandedGraphModal expandedGraph={expandedGraph} processedData={processedData} onClose={() => setExpandedGraph(null)} />
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title />
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleRefreshData}className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"title="Refresh Data">
            <RefreshCw size={18} />
          </button>

          <a href='/model' className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors" title="Data ">
            <Puzzle size={18} />
          </a>
          
          <button onClick={toggleStreaming} className={`px-4 py-2 rounded flex items-center gap-2 ${isStreaming ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors`}>
            {isStreaming ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 grid-rows-4 gap-3">
        <GraphContainer data={processedData.accelerationX} groupKey="accelerationX" yMin={groupInfo.accelerationX.yMin} yMax={groupInfo.accelerationX.yMax} onExpand={handleExpandGraph}/>
        <GraphContainer data={processedData.accelerationY} groupKey="accelerationY" yMin={groupInfo.accelerationY.yMin} yMax={groupInfo.accelerationY.yMax} onExpand={handleExpandGraph}/>     
        <GraphContainer data={processedData.accelerationZ} groupKey="accelerationZ" yMin={groupInfo.accelerationZ.yMin} yMax={groupInfo.accelerationZ.yMax} onExpand={handleExpandGraph}/> 
        <div className='row-span-2'>
          <TelemetryData className="border border-gray-300"/>
        </div>
        <GraphContainer data={processedData.gyroscope} groupKey="gyroscope" yMin={groupInfo.gyroscope.yMin} yMax={groupInfo.gyroscope.yMax} onExpand={handleExpandGraph}/>
        <div className='row-span-2 col-span-2'>
          <CameraDetection className="border border-gray-300"/>
        </div>
        <GraphContainer data={processedData.altitude} groupKey="altitude" yMin={groupInfo.altitude.yMin} yMax={groupInfo.altitude.yMax} onExpand={handleExpandGraph}/>
        <GraphContainer data={processedData.pressure} groupKey="pressure" yMin={groupInfo.pressure.yMin} yMax={groupInfo.pressure.yMax} onExpand={handleExpandGraph} />
        <GraphContainer data={processedData.temperature} groupKey="temperature" yMin={groupInfo.temperature.yMin} yMax={groupInfo.temperature.yMax} onExpand={handleExpandGraph} />
        <GraphContainer data={processedData.magneticFlux} groupKey="magneticFlux" yMin={groupInfo.magneticFlux.yMin} yMax={groupInfo.magneticFlux.yMax} onExpand={handleExpandGraph}/>
      </div>
    </div>
  );
};

export default Data;