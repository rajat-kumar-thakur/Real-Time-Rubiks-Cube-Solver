"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, RotateCw, Copy, Download } from 'lucide-react';

interface SolutionStepsProps {
  steps: string[];
  currentStep: 'scan' | 'solve' | 'complete';
  isSolving: boolean;
}

const moveExplanations: { [key: string]: string } = {
  "R": "Rotate right face clockwise",
  "R'": "Rotate right face counter-clockwise",
  "L": "Rotate left face clockwise",
  "L'": "Rotate left face counter-clockwise",
  "U": "Rotate upper face clockwise",
  "U'": "Rotate upper face counter-clockwise",
  "D": "Rotate down face clockwise",
  "D'": "Rotate down face counter-clockwise",
  "F": "Rotate front face clockwise",
  "F'": "Rotate front face counter-clockwise",
  "B": "Rotate back face clockwise",
  "B'": "Rotate back face counter-clockwise",
  "M": "Rotate middle slice like L",
  "E": "Rotate equatorial slice like D",
  "S": "Rotate standing slice like F"
};

export default function SolutionSteps({ steps, currentStep, isSolving }: SolutionStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const copySteps = () => {
    navigator.clipboard.writeText(steps.join(' '));
  };

  const downloadSteps = () => {
    const stepsText = steps.map((step, index) => 
      `${index + 1}. ${step} - ${moveExplanations[step] || 'Unknown move'}`
    ).join('\n');
    
    const blob = new Blob([stepsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cube-solution.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (currentStep === 'scan') {
    return (
      <div className="text-center py-12 text-slate-400">
        <RotateCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Complete cube scanning to view solution steps</p>
      </div>
    );
  }

  if (isSolving) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-300">Analyzing cube and generating optimal solution...</p>
        <p className="text-sm text-slate-500 mt-2">This may take a few seconds</p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No solution steps yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Solution ({steps.length} moves)
          </h3>
          <p className="text-sm text-slate-400">
            {completedSteps.length}/{steps.length} completed
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={copySteps}
            className="border-slate-600 text-slate-300"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={downloadSteps}
            className="border-slate-600 text-slate-300"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps List */}
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isExpanded = expandedStep === index;
            
            return (
              <Card 
                key={index}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-green-900/30 border-green-700' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                }`}
                onClick={() => setExpandedStep(isExpanded ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-slate-500 rounded-full" />
                      )}
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {index + 1}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-white">
                        {step}
                      </div>
                      {isExpanded && (
                        <div className="text-sm text-slate-400 mt-1">
                          {moveExplanations[step] || 'Unknown move'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isCompleted && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepComplete(index);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Completion Message */}
      {completedSteps.length === steps.length && steps.length > 0 && (
        <Card className="p-4 bg-green-900/30 border-green-700 text-center">
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-semibold">
            Congratulations! Cube solved successfully!
          </p>
          <p className="text-sm text-slate-400 mt-1">
            You completed all {steps.length} moves
          </p>
        </Card>
      )}
    </div>
  );
}