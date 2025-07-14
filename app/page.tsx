"use client";

import { useState } from 'react';
import CameraScanner from '@/components/CameraScanner';
import CubeVisualization from '@/components/CubeVisualization';
import SolutionSteps from '@/components/SolutionSteps';
import VirtualCube from '@/components/VirtualCube';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cuboid as Cube, Camera, RotateCcw, Play, Pause, Monitor, Scan } from 'lucide-react';

export default function Home() {
  const [activeMode, setActiveMode] = useState<'scan' | 'virtual'>('scan');
  const [currentStep, setCurrentStep] = useState<'scan' | 'solve' | 'complete'>('scan');
  const [cubeState, setCubeState] = useState<string | null>(null);
  const [solution, setSolution] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [scannedFaces, setScannedFaces] = useState(0);
  const [isAnimatingMoves, setIsAnimatingMoves] = useState(false);

  const handleVirtualSolve = (moves: string[]) => {
    setSolution(moves);
    setCurrentStep('complete');
  };

  const handleAnimationComplete = () => {
    setIsAnimatingMoves(false);
  };

  const handleMoveExecuted = (moveIndex: number) => {
    // Optional: Add any logic when a move is executed
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setCurrentStep('scan');
    setScannedFaces(0);
  };

  const handleFaceScanned = (faceData: any, faceNumber: number) => {
    setScannedFaces(faceNumber + 1);
    if (faceNumber === 5) {
      // All faces scanned
      setIsScanning(false);
      setCubeState('scanned');
      setCurrentStep('solve');
    }
  };

  const handleSolveCube = () => {
    setIsSolving(true);
    setIsAnimatingMoves(true);
    // Simulate solving process
    setTimeout(() => {
      setSolution([
        "R", "U", "R'", "F", "R", "F'", "U'", "R'", "F'", "U", "F",
        "R", "U'", "R'", "U", "R", "U", "R'", "F'", "U'", "F",
        "R", "U", "R'", "U'", "R'", "F", "R", "F'"
      ]);
      setIsSolving(false);
      setCurrentStep('complete');
      setIsAnimatingMoves(false);
    }, 2000);
  };

  const handleReset = () => {
    setActiveMode('scan');
    setCurrentStep('scan');
    setCubeState(null);
    setSolution([]);
    setIsScanning(false);
    setIsSolving(false);
    setScannedFaces(0);
    setIsAnimatingMoves(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CubeSolver AI</h1>
                <p className="text-slate-400">Real-time Rubik's Cube Solver</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {activeMode === 'scan' ? (
                  <>
                    {currentStep === 'scan' && 'Scanning Mode'}
                    {currentStep === 'solve' && 'Ready to Solve'}
                    {currentStep === 'complete' && 'Solution Ready'}
                  </>
                ) : (
                  'Virtual Mode'
                )}
              </Badge>
              <Button 
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Mode Selector */}
        <div className="mb-8">
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as 'scan' | 'virtual')}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-800 border-slate-700">
              <TabsTrigger 
                value="scan" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Scan className="h-4 w-4 mr-2" />
                Camera Scan
              </TabsTrigger>
              <TabsTrigger 
                value="virtual" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Virtual Cube
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Camera/Visualization */}
          <div className="space-y-6">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  {activeMode === 'scan' ? (
                    <>
                      <Camera className="h-5 w-5 mr-2 text-blue-400" />
                      {currentStep === 'scan' ? 'Cube Scanner' : 'Cube Visualization'}
                    </>
                  ) : (
                    <>
                      <Monitor className="h-5 w-5 mr-2 text-blue-400" />
                      Virtual 3D Cube
                    </>
                  )}
                </h2>
                {activeMode === 'scan' && currentStep === 'scan' && (
                  <Badge className="bg-green-600 text-white">
                    {scannedFaces}/6 faces
                  </Badge>
                )}
              </div>
              
              {activeMode === 'scan' ? (
                currentStep === 'scan' ? (
                  <CameraScanner 
                    isScanning={isScanning}
                    onFaceScanned={handleFaceScanned}
                    scannedFaces={scannedFaces}
                  />
                ) : (
                  <CubeVisualization 
                    cubeState={cubeState}
                    solution={solution}
                    isAnimating={isAnimatingMoves}
                    onAnimationComplete={handleAnimationComplete}
                    onMoveExecuted={handleMoveExecuted}
                  />
                )
              ) : (
                <VirtualCube 
                  onSolve={handleVirtualSolve}
                  isAnimating={isAnimatingMoves}
                  onAnimationComplete={handleAnimationComplete}
                  onMoveExecuted={handleMoveExecuted}
                />
              )}
              
              {activeMode === 'scan' && currentStep === 'scan' && !isScanning && (
                <div className="mt-4 text-center">
                  <Button 
                    onClick={handleStartScan}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-slate-800 border-slate-700 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {activeMode === 'scan' ? scannedFaces : '6'}
                </div>
                <div className="text-sm text-slate-400">
                  {activeMode === 'scan' ? 'Faces Scanned' : 'Cube Faces'}
                </div>
              </Card>
              <Card className="p-4 bg-slate-800 border-slate-700 text-center">
                <div className="text-2xl font-bold text-green-400">{solution.length}</div>
                <div className="text-sm text-slate-400">Solution Steps</div>
              </Card>
              <Card className="p-4 bg-slate-800 border-slate-700 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {solution.length > 0 ? Math.ceil(solution.length / 4) : 0}
                </div>
                <div className="text-sm text-slate-400">Seconds Est.</div>
              </Card>
            </div>
          </div>

          {/* Right Panel - Solution Steps */}
          <div className="space-y-6">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Solution Steps
                </h2>
                {currentStep === 'solve' && cubeState && (
                  <Button 
                    onClick={handleSolveCube}
                    disabled={isSolving || isAnimatingMoves}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSolving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Solving...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Solve Cube
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <SolutionSteps 
                steps={solution}
                currentStep={activeMode === 'virtual' && solution.length > 0 ? 'complete' : currentStep}
                isSolving={isSolving || isAnimatingMoves}
              />
            </Card>

            {/* Instructions */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                {activeMode === 'scan' ? 'Camera Mode' : 'Virtual Mode'}
              </h3>
              {activeMode === 'scan' ? (
                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-600 text-white min-w-fit">1</Badge>
                    <p className="text-sm">Click "Start Scanning" and show each face of your cube to the camera</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-600 text-white min-w-fit">2</Badge>
                    <p className="text-sm">Wait for all 6 faces to be detected and analyzed</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-600 text-white min-w-fit">3</Badge>
                    <p className="text-sm">Click "Solve Cube" to generate the optimal solution</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-600 text-white min-w-fit">4</Badge>
                    <p className="text-sm">Follow the step-by-step moves to solve your cube</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-orange-600 text-white min-w-fit">1</Badge>
                    <p className="text-sm">Click "Scramble Cube" to randomly mix the virtual cube</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-orange-600 text-white min-w-fit">2</Badge>
                    <p className="text-sm">Use rotation controls to view from different angles</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-orange-600 text-white min-w-fit">3</Badge>
                    <p className="text-sm">Click "Solve Cube" to get step-by-step solution</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-orange-600 text-white min-w-fit">4</Badge>
                    <p className="text-sm">Practice with the virtual cube anytime!</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}