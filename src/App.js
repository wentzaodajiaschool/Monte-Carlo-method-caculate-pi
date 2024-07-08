import React, { useState, useEffect, useRef } from 'react';

const CircleIndicator = ({ colors }) => (
  <div className="w-4 h-4 rounded-full mr-2 inline-block" style={{
    background: colors.length === 1 ? colors[0] : `linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`
  }}></div>
);

const MonteCarloPiSimulator = () => {
  const [totalPoints, setTotalPoints] = useState(30000);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [insideCircle, setInsideCircle] = useState(0);
  const [outsideCircle, setOutsideCircle] = useState(0);
  const [estimatedPi, setEstimatedPi] = useState(0);
  const [difference, setDifference] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullCircle, setIsFullCircle] = useState(true);
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);
  const [isSimulationCompleted, setIsSimulationCompleted] = useState(false);
  const [customPointsInput, setCustomPointsInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const resultRef = useRef(null);

  const drawCircle = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    if (isFullCircle) {
      ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
    } else {
      ctx.arc(0, size, size, -Math.PI/2, 0);
    }
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  };

  useEffect(() => {
    drawCircle();
  }, [isFullCircle]);

  const simulate = () => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.width, canvas.height);
    
    let points = currentPoints;
    let inside = insideCircle;
    let interval = 50;

    const step = () => {
      if (points >= totalPoints) {
        setIsRunning(false);
        setIsSimulationCompleted(true);
        resultRef.current.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      for (let i = 0; i < 10; i++) {
        let x, y, distance;
        if (isFullCircle) {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          distance = Math.sqrt(x * x + y * y);
        } else {
          x = Math.random();
          y = Math.random();
          distance = Math.sqrt(x * x + y * y);
        }

        if (isFullCircle) {
          ctx.fillStyle = distance <= 1 ? '#337b68' : '#f4d04f';
          ctx.fillRect((x + 1) * size/2, (y + 1) * size/2, 2, 2);
        } else {
          ctx.fillStyle = distance <= 1 ? '#337b68' : '#f4d04f';
          ctx.fillRect(x * size, (1 - y) * size, 2, 2);
        }

        if (distance <= 1) {
          inside++;
        }

        points++;
      }

      const piEstimate = isFullCircle ? (4 * inside) / points : (2 * inside) / points;
      setCurrentPoints(points);
      setInsideCircle(inside);
      setOutsideCircle(points - inside);
      setEstimatedPi(piEstimate);
      setDifference((Math.abs(Math.PI - piEstimate) / Math.PI) * 100);

      if (points > totalPoints / 2) {
        interval = 0.1;
      }

      animationRef.current = setTimeout(() => requestAnimationFrame(step), interval);
    };

    step();
  };

  useEffect(() => {
    if (isRunning) {
      simulate();
    } else {
      clearTimeout(animationRef.current);
    }

    return () => clearTimeout(animationRef.current);
  }, [isRunning]);

  const toggleSimulation = () => {
    if (isSimulationCompleted) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (!isSimulationStarted) {
      setIsSimulationStarted(true);
      setIsRunning(true);
      setIsSimulationCompleted(false);
      drawCircle();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setIsSimulationStarted(false);
    setIsSimulationCompleted(false);
    setCurrentPoints(0);
    setInsideCircle(0);
    setOutsideCircle(0);
    setEstimatedPi(0);
    setDifference(0);
    drawCircle();
  };

  const handleTotalPointsChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setTotalPoints(parseInt(value));
    }
  };

  const handleCustomPointsSubmit = () => {
    const customValue = parseInt(customPointsInput);
    if (!isNaN(customValue) && customValue > 0) {
      setTotalPoints(customValue);
      setShowCustomInput(false);
      setCustomPointsInput('');
    } else {
      alert('請輸入有效的正整數！');
    }
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">文藻美語程式設計課<br/>蒙地卡羅方法 π 值模擬器</h1>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 relative overflow-hidden w-full h-12">
        <div className={`flex items-center justify-center transition-transform duration-300 ${showCustomInput ? '-translate-x-full' : 'translate-x-0'} w-full absolute`}>
          <label className="mr-2">總點數：</label>
          <select
            value={totalPoints}
            onChange={handleTotalPointsChange}
            disabled={isSimulationStarted}
            className="border rounded px-2 py-1 disabled:bg-gray-300 disabled:text-gray-600"
          >
            <option value="10000">10000</option>
            <option value="20000">20000</option>
            <option value="30000">30000</option>
            {totalPoints !== 10000 && totalPoints !== 20000 && totalPoints !== 30000 && (
              <option value={totalPoints}>{totalPoints}</option>
            )}
            <option value="custom">來個刺激的</option>
          </select>
        </div>
        <div className={`absolute left-full flex items-center justify-center transition-transform duration-300 ${showCustomInput ? '-translate-x-full' : 'translate-x-0'} w-full`}>
          <input
            type="number"
            value={customPointsInput}
            onChange={(e) => setCustomPointsInput(e.target.value)}
            className="border rounded px-2 py-1 w-40 mr-2"
            placeholder="輸入點數"
          />
          <button
            onClick={handleCustomPointsSubmit}
            className="bg-green-500 text-white px-3 py-1 rounded flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center">
          <label className="mr-2">形狀：</label>
          <select
            value={isFullCircle ? "full" : "half"}
            onChange={(e) => {
              setIsFullCircle(e.target.value === "full");
              resetSimulation();
            }}
            disabled={isSimulationStarted}
            className="border rounded px-2 py-1 disabled:bg-gray-300 disabled:text-gray-600"
          >
            <option value="full">整圓</option>
            <option value="half">半圓</option>
          </select>
        </div>
        <button
          onClick={toggleSimulation}
          className={`${isRunning ? 'bg-red-500' : 'bg-blue-500'} text-white px-4 py-1 rounded`}
        >
          {isSimulationCompleted ? '完成模擬' : 
           isSimulationStarted ? (isRunning ? '暫停模擬' : '繼續模擬') : 
           '開始模擬'}
        </button>
      </div>
      <div className="mb-4 w-full max-w-sm">
        <canvas ref={canvasRef} width="300" height="300" className="border w-full h-auto"></canvas>
      </div>
      <div className="w-full text-center mb-4">
        <p className="flex items-center justify-center">
          <CircleIndicator colors={['#337b68', '#f4d04f']} />
          當前點數：{currentPoints}
        </p>
      </div>
      <div ref={resultRef} className="text-left w-full max-w-sm grid grid-cols-2 gap-4 sm:grid-cols-1">
        <div>
          <p className="flex items-center">
            <CircleIndicator colors={['#337b68']} />
            圓內點數：{insideCircle}
          </p>
          <p className="flex items-center">
            <CircleIndicator colors={['#f4d04f']} />
            圓外點數：{outsideCircle}
          </p>
        </div>
        <div>
          <p>估算的 π 值：{estimatedPi.toFixed(6)}</p>
          <p>與實際 π 值的差：{difference.toFixed(2)}%</p>
        </div>
      </div>
      <button
        onClick={resetSimulation}
        className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
      >
        重新模擬
      </button>
    </div>
  );
};

export default MonteCarloPiSimulator;