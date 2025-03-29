import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Maximize2 } from 'lucide-react';
import { colors, groupInfo } from '../dataContext';

export const Graph = ({ title, description, data, colors, yMin, yMax, fullsize = false }) => {
  if (!data || data.length === 0) return null;
  
  const sortedData = [...data].sort((a, b) => a.time - b.time);
  const params = Object.keys(sortedData[0]).filter(key => key !== 'time');

  if (params.length === 0) return null;

  const formatTime = (value) => (value / 600000).toFixed(2);

  const minTime = sortedData[0].time;
  const maxTime = sortedData[sortedData.length - 1].time;
  const step = Math.max((maxTime - minTime) / 5, 1);
  
  const fixedTicks = [];
  for (let i = 0; i <= 5; i++) {
    const tickValue = minTime + i * step;
    if (i === 0) {
      fixedTicks.push(minTime);
    } else if (i === 5) {
      fixedTicks.push(maxTime);
    } else {
      fixedTicks.push(tickValue);
    }
  }

  const yTicks = [];
  if (typeof yMin === 'number' && typeof yMax === 'number') {
    const intervalCount = 6;
    const step = (yMax - yMin) / intervalCount;
    for (let i = 0; i <= intervalCount; i++) {
      yTicks.push(Math.floor(yMin + i * step));
    }
  }

  return (
    <div className="border rounded-lg p-2 shadow-sm h-full flex flex-col">
      <div className='flex justify-between'>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-xs text-gray-400 mb-2">{description}</p>
      </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'insideBottomRight', offset: -10, stroke: 'lightgray', fontSize: 12 }} tick={{ fontSize: 10, stroke: 'lightgray' }} tickFormatter={formatTime} type="number" domain={[minTime, maxTime]} ticks={fixedTicks} tickLine={{ key: (value) => `tickLine-${value}` }}/>
            <YAxis domain={[yMin, yMax]} tick={{ fontSize: 10, stroke: 'lightgray' }} ticks={yTicks} />
            <Tooltip contentStyle={{ fontSize: 12 }} labelFormatter={formatTime} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {params.map(param => (
              <Line key={param} type="monotone" dataKey={param} name={param} stroke={colors[param]} dot={false} isAnimationActive={false} activeDot={{ r: 4 }} strokeWidth={1.5}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const GraphContainer = ({ data, groupKey, yMin, yMax, xMin, xMax, onExpand }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use group-specific min/max values if prop values aren't provided
  const effectiveYMin = yMin !== undefined ? yMin : (groupInfo[groupKey]?.yMin);
  const effectiveYMax = yMax !== undefined ? yMax : (groupInfo[groupKey]?.yMax);
  
  return (
    <div className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transition-all duration-200 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {isHovered && (
          <button onClick={() => onExpand(groupKey, colors)} className="p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors" title="Expand">
            <Maximize2 size={16} className="text-gray-300" />
          </button>
        )}
      </div>
      <div className="h-full p-3">
        <div className='h-full'>
          <Graph title={groupInfo[groupKey]?.title || groupKey} description={groupInfo[groupKey]?.description || ''} data={data} colors={colors} yMin={effectiveYMin} yMax={effectiveYMax} xMin={xMin} xMax={xMax}/>
        </div>
      </div>
    </div>
  );
};

// Expanded Graph Modal Component
export const ExpandedGraphModal = ({ expandedGraph, processedData, onClose }) => {
  if (!expandedGraph) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-5xl h-3/4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-200">
            {groupInfo[expandedGraph].icon} {groupInfo[expandedGraph].title} Details
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex-grow p-4">
          <Graph 
            title={groupInfo[expandedGraph].title} 
            description={groupInfo[expandedGraph].description} 
            data={processedData[expandedGraph]} 
            colors={colors}
            fullsize={true} 
            yMin={groupInfo[expandedGraph].yMin} 
            yMax={groupInfo[expandedGraph].yMax} 
            xMin={groupInfo[expandedGraph].xMin} 
            xMax={groupInfo[expandedGraph].xMax}
          />
        </div>
      </div>
    </div>
  );
};

export default GraphContainer;