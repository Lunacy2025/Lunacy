import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import dataManager, { colors } from '../dataContext';
import GraphContainer, { ExpandedGraphModal } from '../Components/Graph';
import { groupInfo } from '../dataContext';

function Floor() {
  return (
    <Grid args={[30, 30]} cellSize={1} cellThickness={1} cellColor="#6f6f6f" sectionSize={3} sectionThickness={1.5} sectionColor="#9d4b4b" position={[0, 0, 0]} infiniteGrid fadeDistance={50}/>
  );
}

function Model({ gyroData, currentIndex, scale }) {
  const modelRef = useRef();
  const { nodes, materials } = useGLTF('/scene.gltf');
  
  const initialPosition = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame(() => {
    if (gyroData.length > 0 && currentIndex < gyroData.length) {
      const data = gyroData[currentIndex];
      
      if (modelRef.current) {
        modelRef.current.position.copy(initialPosition.current);
        
        modelRef.current.rotation.x = data.GX || 0;
        modelRef.current.rotation.y = data.GY || 0;
        modelRef.current.rotation.z = data.GZ || 0;
      }
    }
  });

  return (
    <group ref={modelRef} scale={scale} dispose={null}>
      {nodes?.Object_2 ? (
        <mesh geometry={nodes.Object_2.geometry} material={materials?.default} rotation={[Math.PI, 0, 0]} castShadow receiveShadow />
      ) : (
        <mesh>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </group>
  );
}

export function Scene() {
  const [gyroData, setGyroData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  
  
  useEffect(() => {
    dataManager.fetchData();
    
    const unsubscribe = dataManager.subscribe(data => {
      if (!data.loading && data.rawData.length > 0) {
        setGyroData(data.rawData);
        setTotalFrames(data.rawData.length - 1);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!isPlaying || gyroData.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= gyroData.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, gyroData]);


  return (
    <div className="h-screen w-screen">
      <div className="absolute top-4 left-4 z-10 p-4 bg-black bg-opacity-50 text-white rounded">
        <button className="px-4 py-2 bg-blue-500 rounded mr-2" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input type="range" min="0" max={totalFrames} value={currentIndex} onChange={(e) => setCurrentIndex(parseInt(e.target.value))}disabled={gyroData.length === 0}className="w-64"/>
      </div>
      <Canvas shadows camera={{     position: [17, 27, 20],    fov: 45 }}>
        <color attach="background" args={['#0cbfc8']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
        <Suspense fallback={null}>
          <Model scale={[0.02, 0.02, 0.02]} gyroData={gyroData} currentIndex={currentIndex} />
          <Floor />
        </Suspense>
        <OrbitControls target={[0, 0, 0]} makeDefaultenableDampingdampingFactor={0.05} minDistance={5} maxDistance={70} initialPosition={[15, 15, 15]}/>
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/scene.gltf');