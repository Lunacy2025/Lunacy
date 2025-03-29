import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, VideoOff, ChevronDown } from "lucide-react";

const CameraDetection = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const detectConnectionType = (label = "") => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("usb")) return "usb";
    if (lowerLabel.includes("bluetooth")) return "bluetooth";
    if (lowerLabel.includes("wifi") || lowerLabel.includes("wireless")) return "wireless";
    if (lowerLabel.includes("built-in") || lowerLabel.includes("integrated")) return "integrated";
    return "unknown";
  };

  const detectCameras = async () => {
    setLoading(true);
    setError(null);

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      if (videoDevices.length === 0) throw new Error("No video devices found");

      const cameraList = videoDevices.map((device, index) => ({
        id: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
        type: detectConnectionType(device.label),
      }));

      setCameras(cameraList);
      if (!selectedCamera && cameraList.length > 0) {
        setSelectedCamera(cameraList[0].id);
      }
    } catch (error) {
      setError(error.message);
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  const startStream = async (deviceId) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setError(`Failed to start stream: ${error.message}`);
      streamRef.current = null;
    }
  };

  const handleCameraChange = (e) => {
    const deviceId = e.target.value;
    setSelectedCamera(deviceId);
    startStream(deviceId);
  };

  useEffect(() => {
    detectCameras();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (selectedCamera) startStream(selectedCamera);
  }, [selectedCamera]);

  return (
    <div className="flex flex-col p-5">
      <header className="flex flex-row justify-between mb-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-blue-400 border-t-transparent"></div>
            <p className="text-gray-400 text-sm">Scanning for devices...</p>
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400/80">
            <VideoOff className="h-12 w-12" />
            <p>No cameras detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative group">
              <select value={selectedCamera || ""} onChange={handleCameraChange} className="w-full backdrop-blur-sm border border-gray-700/60 text-white py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 cursor-pointer transition-all" >
                <option value="" disabled>
                  Select camera source...
                </option>
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id} className="text-black">
                    {camera.label} ({camera.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <button onClick={detectCameras} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 group">
          <RefreshCw className="h-5 w-5 text-blue-400 group-hover:rotate-180 transition-transform" />
          <span className="hidden sm:inline">Rescan Devices</span>
        </button>
      </header>
      <div className="w-full">
        <div className="aspect-video bg-gray-900/50 rounded-xl overflow-hidden relative">
          {selectedCamera ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 pointer-events-none" />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400/80 p-6">
              <VideoOff className="h-12 w-12 mb-3" />
              <p className="text-center">Select a camera from the list to begin streaming</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraDetection;
