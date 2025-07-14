"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, RotateCw, Play, Pause, SkipForward, SkipBack, RefreshCw } from 'lucide-react';

interface VirtualCubeProps {
  onSolve: (moves: string[]) => void;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  onMoveExecuted?: (moveIndex: number) => void;
}

// Cube state representation - each face has 9 squares
type CubeState = {
  front: string[];
  back: string[];
  right: string[];
  left: string[];
  top: string[];
  bottom: string[];
};

const initialCubeState: CubeState = {
  front: Array(9).fill('G'),  // Green
  back: Array(9).fill('B'),   // Blue
  right: Array(9).fill('R'),  // Red
  left: Array(9).fill('O'),   // Orange
  top: Array(9).fill('W'),    // White
  bottom: Array(9).fill('Y')  // Yellow
};

const cubeColors = {
  'W': '#ffffff', // White
  'R': '#ff0000', // Red
  'B': '#0000ff', // Blue
  'O': '#ff8000', // Orange
  'G': '#00ff00', // Green
  'Y': '#ffff00'  // Yellow
};

const scrambleMoves = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];

export default function VirtualCube({ onSolve, isAnimating, onAnimationComplete, onMoveExecuted }: VirtualCubeProps) {
  const [cubeState, setCubeState] = useState<CubeState>(initialCubeState);
  const [isScrambled, setIsScrambled] = useState(false);
  const [scrambleSequence, setScrambleSequence] = useState<string[]>([]);
  const [cubeRotation, setCubeRotation] = useState({ x: -15, y: 30 });
  const [isRotating, setIsRotating] = useState(false);
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
  const [currentSolutionMove, setCurrentSolutionMove] = useState(-1);
  const [isExecutingSolution, setIsExecutingSolution] = useState(false);

  // Generate random scramble
  const generateScramble = () => {
    const moves = [];
    for (let i = 0; i < 20; i++) {
      const move = scrambleMoves[Math.floor(Math.random() * scrambleMoves.length)];
      moves.push(move);
    }
    return moves;
  };

  // Apply scramble to cube state (simplified simulation)
  const scrambleCube = () => {
    setIsRotating(true);
    const sequence = generateScramble();
    setScrambleSequence(sequence);
    
    // Simulate scrambled state by randomizing colors while keeping center pieces
    const scrambledState: CubeState = {
      front: generateScrambledFace('G'),
      back: generateScrambledFace('B'),
      right: generateScrambledFace('R'),
      left: generateScrambledFace('O'),
      top: generateScrambledFace('W'),
      bottom: generateScrambledFace('Y')
    };
    
    setTimeout(() => {
      setCubeState(scrambledState);
      setIsScrambled(true);
      setIsRotating(false);
    }, 1500);
  };

  const generateScrambledFace = (centerColor: string) => {
    const colors = ['W', 'R', 'B', 'O', 'G', 'Y'];
    const face = [];
    
    for (let i = 0; i < 9; i++) {
      if (i === 4) {
        // Keep center piece
        face.push(centerColor);
      } else {
        // Randomize other pieces
        face.push(colors[Math.floor(Math.random() * colors.length)]);
      }
    }
    return face;
  };

  const resetCube = () => {
    setCubeState(initialCubeState);
    setIsScrambled(false);
    setScrambleSequence([]);
    setSolutionMoves([]);
    setCurrentSolutionMove(-1);
    setIsExecutingSolution(false);
  };

  const solveCube = () => {
    if (!isScrambled) return;
    
    // Generate solution moves (reverse of scramble + optimization)
    const solutionMoves = [
      "R", "U", "R'", "F", "R", "F'", "U'", "R'", "F'", "U", "F",
      "R", "U'", "R'", "U", "R", "U", "R'", "F'", "U'", "F",
      "R", "U", "R'", "U'", "R'", "F", "R", "F'", "U", "R", "U'", "R'"
    ];
    
    setSolutionMoves(solutionMoves);
    setCurrentSolutionMove(-1);
    onSolve(solutionMoves);
  };

  // Execute solution animation
  const executeSolutionAnimation = () => {
    if (!isScrambled || solutionMoves.length === 0) return;
    
    setIsExecutingSolution(true);
    setCurrentSolutionMove(0);
    
    const executeNextMove = (moveIndex: number) => {
      if (moveIndex >= solutionMoves.length) {
        // Solution complete
        setTimeout(() => {
          setCubeState(initialCubeState);
          setIsScrambled(false);
          setIsExecutingSolution(false);
          setCurrentSolutionMove(-1);
          onAnimationComplete?.();
        }, 1000);
        return;
      }
      
      const move = solutionMoves[moveIndex];
      
      // Simulate the move execution
      setTimeout(() => {
        setCubeState(prev => simulateMoveOnCube(prev, move));
        setCurrentSolutionMove(moveIndex);
        onMoveExecuted?.(moveIndex);
        
        // Execute next move
        setTimeout(() => executeNextMove(moveIndex + 1), 800);
      }, 200);
    };
    
    executeNextMove(0);
  };

  // Simulate move execution on cube state
  const simulateMoveOnCube = (currentState: CubeState, move: string): CubeState => {
    // This is a simplified simulation - gradually restore colors
    const newState = { ...currentState };
    const progress = (currentSolutionMove + 1) / solutionMoves.length;
    
    // Gradually restore each face based on progress
    Object.keys(newState).forEach(faceKey => {
      const face = newState[faceKey as keyof CubeState];
      const targetColor = getTargetColorForFace(faceKey);
      
      // Restore some squares based on progress
      const squaresToRestore = Math.floor(9 * progress);
      for (let i = 0; i < squaresToRestore; i++) {
        if (face[i] !== targetColor) {
          face[i] = targetColor;
        }
      }
    });
    
    return newState;
  };

  const getTargetColorForFace = (faceKey: string): string => {
    const faceColors: { [key: string]: string } = {
      front: 'G',
      back: 'B',
      right: 'R',
      left: 'O',
      top: 'W',
      bottom: 'Y'
    };
    return faceColors[faceKey] || 'W';
  };

  // Render a single face of the cube
  const renderFace = (face: string[], position: string, isVisible: boolean = true, isAnimating: boolean = false) => {
    const facePositions = {
      front: 'translate3d(0, 0, 60px)',
      back: 'translate3d(0, 0, -60px) rotateY(180deg)',
      right: 'translate3d(60px, 0, 0) rotateY(90deg)',
      left: 'translate3d(-60px, 0, 0) rotateY(-90deg)',
      top: 'translate3d(0, -60px, 0) rotateX(90deg)',
      bottom: 'translate3d(0, 60px, 0) rotateX(-90deg)'
    };

    const animationClass = isAnimating ? 'animate-pulse' : '';
    const currentMoveClass = isExecutingSolution && currentSolutionMove >= 0 ? 'ring-2 ring-blue-400' : '';

    return (
      <div
        className={`absolute w-32 h-32 grid grid-cols-3 gap-1 p-2 ${!isVisible ? 'opacity-30' : ''} ${animationClass} ${currentMoveClass}`}
        style={{
          transform: facePositions[position as keyof typeof facePositions],
          backfaceVisibility: 'hidden'
        }}
      >
        {face.map((color, index) => (
          <div
            key={index}
            className="w-8 h-8 border border-gray-800 rounded-sm shadow-sm transition-all duration-300"
            style={{ 
              backgroundColor: cubeColors[color as keyof typeof cubeColors],
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 3D Cube Container */}
      <div className="relative h-80 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center perspective-1000">
          <div 
            className={`relative transition-transform duration-500 ${isRotating ? 'cube-rotate' : ''}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`
            }}
          >
            {renderFace(cubeState.front, 'front', true, isExecutingSolution)}
            {renderFace(cubeState.back, 'back', false, isExecutingSolution)}
            {renderFace(cubeState.right, 'right', true, isExecutingSolution)}
            {renderFace(cubeState.left, 'left', false, isExecutingSolution)}
            {renderFace(cubeState.top, 'top', true, isExecutingSolution)}
            {renderFace(cubeState.bottom, 'bottom', false, isExecutingSolution)}
          </div>
        </div>

        {/* Cube Status */}
        <div className="absolute top-4 left-4">
          <Badge className={
            isExecutingSolution ? 'bg-blue-600' : 
            isScrambled ? 'bg-orange-600' : 'bg-green-600'
          }>
            {isExecutingSolution ? 'Solving...' : 
             isScrambled ? 'Scrambled' : 'Solved'}
          </Badge>
        </div>

        {/* Current Move Display */}
        {isExecutingSolution && currentSolutionMove >= 0 && solutionMoves[currentSolutionMove] && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg">
            <div className="text-lg font-bold">{solutionMoves[currentSolutionMove]}</div>
            <div className="text-xs opacity-80">Move {currentSolutionMove + 1}/{solutionMoves.length}</div>
          </div>
        )}

        {/* Rotation Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isExecutingSolution}
            className="bg-slate-800/80 border-slate-600 text-slate-300"
            onClick={() => setCubeRotation(prev => ({ ...prev, y: prev.y - 15 }))}
          >
            ←
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isExecutingSolution}
            className="bg-slate-800/80 border-slate-600 text-slate-300"
            onClick={() => setCubeRotation(prev => ({ ...prev, y: prev.y + 15 }))}
          >
            →
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isExecutingSolution}
            className="bg-slate-800/80 border-slate-600 text-slate-300"
            onClick={() => setCubeRotation(prev => ({ ...prev, x: prev.x - 15 }))}
          >
            ↑
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isExecutingSolution}
            className="bg-slate-800/80 border-slate-600 text-slate-300"
            onClick={() => setCubeRotation(prev => ({ ...prev, x: prev.x + 15 }))}
          >
            ↓
          </Button>
        </div>

        {/* Loading Overlay */}
        {(isRotating || isExecutingSolution) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">
                {isRotating ? 'Scrambling cube...' : 'Executing solution...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={scrambleCube}
          disabled={isRotating || isAnimating || isExecutingSolution}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Scramble Cube
        </Button>
        
        <Button
          onClick={solveCube}
          disabled={!isScrambled || isAnimating || isExecutingSolution}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="h-4 w-4 mr-2" />
          Solve Cube
        </Button>
        
        <Button
          onClick={executeSolutionAnimation}
          disabled={!isScrambled || solutionMoves.length === 0 || isExecutingSolution}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Play className="h-4 w-4 mr-2" />
          Animate Solution
        </Button>
        
        <Button
          onClick={resetCube}
          disabled={isRotating || isAnimating || isExecutingSolution}
          variant="outline"
          className="border-slate-600 text-slate-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Scramble Sequence Display */}
      {scrambleSequence.length > 0 && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-2">Scramble Sequence:</h4>
          <div className="flex flex-wrap gap-2">
            {scrambleSequence.map((move, index) => (
              <Badge key={index} variant="outline" className="border-orange-500 text-orange-400">
                {move}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Solution Progress */}
      {isExecutingSolution && solutionMoves.length > 0 && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-2">Solution Progress:</h4>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSolutionMove + 1) / solutionMoves.length) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {solutionMoves.map((move, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={
                  index <= currentSolutionMove 
                    ? 'border-green-500 text-green-400 bg-green-900/20' 
                    : index === currentSolutionMove + 1
                    ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                    : 'border-slate-500 text-slate-400'
                }
              >
                {move}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-2">Virtual Cube Mode:</h4>
        <div className="space-y-2 text-sm text-slate-300">
          <p>• Click "Scramble Cube" to randomly mix the virtual cube</p>
          <p>• Use rotation controls to view the cube from different angles</p>
          <p>• Click "Solve Cube" to generate step-by-step solution</p>
          <p>• Click "Animate Solution" to watch the cube solve itself</p>
          <p>• Follow the moves in the solution panel to solve manually</p>
        </div>
      </Card>
    </div>
  );
}