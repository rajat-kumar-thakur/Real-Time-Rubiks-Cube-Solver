"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCw, Play, Pause, SkipForward, SkipBack, Square } from 'lucide-react';

interface CubeVisualizationProps {
  cubeState: string | null;
  solution: string[];
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  onMoveExecuted?: (moveIndex: number) => void;
}

const cubeColors = {
  'W': '#ffffff', // White
  'R': '#ff0000', // Red
  'B': '#0000ff', // Blue
  'O': '#ff8000', // Orange
  'G': '#00ff00', // Green
  'Y': '#ffff00'  // Yellow
};

// Enhanced cube state for animation
type AnimatedCubeState = {
  faces: {
    front: string[];
    back: string[];
    right: string[];
    left: string[];
    top: string[];
    bottom: string[];
  };
  rotationState: {
    face: string;
    angle: number;
    isAnimating: boolean;
  };
};

export default function CubeVisualization({ 
  cubeState, 
  solution, 
  isAnimating, 
  onAnimationComplete,
  onMoveExecuted 
}: CubeVisualizationProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cubeRotation, setCubeRotation] = useState({ x: -15, y: 30 });
  const [animatedCube, setAnimatedCube] = useState<AnimatedCubeState>({
    faces: {
      front: Array(9).fill('G'),
      back: Array(9).fill('B'),
      right: Array(9).fill('R'),
      left: Array(9).fill('O'),
      top: Array(9).fill('W'),
      bottom: Array(9).fill('Y')
    },
    rotationState: {
      face: '',
      angle: 0,
      isAnimating: false
    }
  });
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play solution animation
  useEffect(() => {
    if (isPlaying && currentMoveIndex < solution.length - 1 && solution.length > 0) {
      executeMove(solution[currentMoveIndex + 1], currentMoveIndex + 1);
    } else if (currentMoveIndex >= solution.length - 1) {
      setIsPlaying(false);
      onAnimationComplete?.();
    }
  }, [isPlaying, currentMoveIndex, solution.length, onAnimationComplete]);

  // Execute a single move with animation
  const executeMove = (move: string, moveIndex: number) => {
    if (animatedCube.rotationState.isAnimating) return;

    const face = move.replace("'", "").replace("2", "");
    const isCounterClockwise = move.includes("'");
    const isDouble = move.includes("2");
    
    // Start face rotation animation
    setAnimatedCube(prev => ({
      ...prev,
      rotationState: {
        face,
        angle: 0,
        isAnimating: true
      }
    }));

    // Animate the rotation
    let angle = 0;
    const targetAngle = isDouble ? 180 : 90;
    const direction = isCounterClockwise ? -1 : 1;
    const animationSpeed = 5; // degrees per frame

    const animateRotation = () => {
      angle += animationSpeed;
      
      setAnimatedCube(prev => ({
        ...prev,
        rotationState: {
          ...prev.rotationState,
          angle: angle * direction
        }
      }));

      if (angle < targetAngle) {
        animationRef.current = setTimeout(animateRotation, 16); // ~60fps
      } else {
        // Animation complete - update cube state
        setAnimatedCube(prev => ({
          ...prev,
          faces: simulateMoveOnCube(prev.faces, move),
          rotationState: {
            face: '',
            angle: 0,
            isAnimating: false
          }
        }));
        
        setCurrentMoveIndex(moveIndex);
        onMoveExecuted?.(moveIndex);
      }
    };

    animateRotation();
  };

  // Simulate move execution on cube state
  const simulateMoveOnCube = (faces: any, move: string) => {
    // This is a simplified simulation - in a real app you'd implement full cube mechanics
    const newFaces = { ...faces };
    
    // Randomly shuffle some colors to simulate the move effect
    const face = move.replace("'", "").replace("2", "").toLowerCase();
    if (newFaces[face as keyof typeof newFaces]) {
      const faceArray = [...newFaces[face as keyof typeof newFaces]];
      // Rotate the face array to simulate the move
      const temp = faceArray[0];
      for (let i = 0; i < 8; i++) {
        faceArray[i] = faceArray[i + 1];
      }
      faceArray[8] = temp;
      newFaces[face as keyof typeof newFaces] = faceArray;
    }
    
    return newFaces;
  };

  const handlePlayPause = () => {
    if (currentMoveIndex >= solution.length - 1) {
      setCurrentMoveIndex(-1);
      // Reset cube to scrambled state
      setAnimatedCube(prev => ({
        ...prev,
        faces: {
          front: generateScrambledFace('G'),
          back: generateScrambledFace('B'),
          right: generateScrambledFace('R'),
          left: generateScrambledFace('O'),
          top: generateScrambledFace('W'),
          bottom: generateScrambledFace('Y')
        }
      }));
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (!animatedCube.rotationState.isAnimating) {
      setCurrentMoveIndex(Math.max(-1, currentMoveIndex - 1));
    }
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (!animatedCube.rotationState.isAnimating && currentMoveIndex < solution.length - 1) {
      executeMove(solution[currentMoveIndex + 1], currentMoveIndex + 1);
    }
    setIsPlaying(false);
  };

  const handleReset = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
    setAnimatedCube(prev => ({
      ...prev,
      faces: {
        front: generateScrambledFace('G'),
        back: generateScrambledFace('B'),
        right: generateScrambledFace('R'),
        left: generateScrambledFace('O'),
        top: generateScrambledFace('W'),
        bottom: generateScrambledFace('Y')
      },
      rotationState: {
        face: '',
        angle: 0,
        isAnimating: false
      }
    }));
  };

  const generateScrambledFace = (centerColor: string) => {
    const colors = ['W', 'R', 'B', 'O', 'G', 'Y'];
    const face = [];
    
    for (let i = 0; i < 9; i++) {
      if (i === 4) {
        face.push(centerColor);
      } else {
        face.push(colors[Math.floor(Math.random() * colors.length)]);
      }
    }
    return face;
  };

  // Render cube face with animation support
  const renderCubeFace = (faceColors: string[], faceKey: string, faceIndex: number) => {
    const facePositions = [
      'top-20 left-1/2 transform -translate-x-1/2', // Top
      'top-1/2 right-0 transform -translate-y-1/2', // Right
      'bottom-20 left-1/2 transform -translate-x-1/2', // Bottom
      'top-1/2 left-0 transform -translate-y-1/2', // Left
      'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', // Front
      'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30' // Back (hidden)
    ];

    const isAnimatingFace = animatedCube.rotationState.isAnimating && 
                           animatedCube.rotationState.face.toLowerCase() === faceKey.toLowerCase();
    
    const rotationTransform = isAnimatingFace 
      ? `rotateZ(${animatedCube.rotationState.angle}deg)` 
      : '';

    const faceStyle = {
      transform: rotationTransform,
      transition: isAnimatingFace ? 'none' : 'transform 0.3s ease'
    };

    return (
      <div
        key={faceIndex}
        className={`absolute grid grid-cols-3 gap-0.5 w-20 h-20 ${facePositions[faceIndex]}`}
      >
        {faceColors.map((color, squareIndex) => (
          <div
            key={squareIndex}
            className="w-full h-full border border-gray-400 rounded-sm transition-colors duration-200"
            style={{ 
              backgroundColor: color,
              ...faceStyle
            }}
          />
        ))}
      </div>
    );
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 3D Cube Visualization */}
      <div className="relative h-80 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {cubeState ? (
            <div 
              className="relative w-32 h-32 transition-transform duration-300"
              style={{
                transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`
              }}
            >
              {/* Generate sample cube faces */}
              {[
                { face: animatedCube.faces.top, key: 'top' },
                { face: animatedCube.faces.right, key: 'right' },
                { face: animatedCube.faces.bottom, key: 'bottom' },
                { face: animatedCube.faces.left, key: 'left' },
                { face: animatedCube.faces.front, key: 'front' },
                { face: animatedCube.faces.back, key: 'back' }
              ].map(({ face, key }, index) => renderCubeFace(
                face.map(color => cubeColors[color as keyof typeof cubeColors]),
                key,
                index
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <div className="w-24 h-24 border-2 border-dashed border-slate-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <RotateCw className="h-8 w-8" />
              </div>
              <p>Cube will appear here after scanning</p>
            </div>
          )}
        </div>

        {/* Rotation Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-slate-800/80 border-slate-600 text-slate-300"
            onClick={() => setCubeRotation(prev => ({ ...prev, y: prev.y - 15 }))}
          >
            ←
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-slate-800/80 border-slate-600 text-slate-300"
            onClick={() => setCubeRotation(prev => ({ ...prev, y: prev.y + 15 }))}
          >
            →
          </Button>
        </div>

        {/* Current Move Display */}
        {solution.length > 0 && currentMoveIndex >= 0 && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              {animatedCube.rotationState.isAnimating && (
                <div className="flex items-center space-x-1">
                  <Square className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Executing...</span>
                </div>
              )}
            </div>
            <div className="text-lg font-bold">{solution[currentMoveIndex]}</div>
            <div className="text-xs opacity-80">Step {currentMoveIndex + 1}</div>
          </div>
        )}
      </div>

      {/* Animation Controls */}
      {solution.length > 0 && (
        <div className="flex items-center justify-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentMoveIndex <= -1 || animatedCube.rotationState.isAnimating}
            className="border-slate-600 text-slate-300 disabled:opacity-50"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            disabled={animatedCube.rotationState.isAnimating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            disabled={currentMoveIndex >= solution.length - 1 || animatedCube.rotationState.isAnimating}
            className="border-slate-600 text-slate-300 disabled:opacity-50"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={animatedCube.rotationState.isAnimating}
            className="border-slate-600 text-slate-300"
          >
            Reset
          </Button>
        </div>
      )}

      {/* Progress Indicator */}
      {solution.length > 0 && (
        <div className="text-center text-slate-400 text-sm">
          {animatedCube.rotationState.isAnimating && (
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Executing move: {solution[currentMoveIndex + 1] || solution[currentMoveIndex]}</span>
            </div>
          )}
          Move {Math.max(0, currentMoveIndex + 1)} of {solution.length}
          {currentMoveIndex >= solution.length - 1 && ' - Complete!'}
        </div>
      )}
    </div>
  );
}