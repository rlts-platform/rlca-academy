import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, CheckCircle } from "lucide-react";

export default function InteractiveElement({ element, onComplete, isCompleted }) {
  const typeLabels = {
    h5p: "H5P Interactive",
    simulation: "Simulation",
    drag_drop: "Drag & Drop",
    interactive_video: "Interactive Video",
    virtual_lab: "Virtual Lab"
  };

  const renderElement = () => {
    if (element.embed_code) {
      return (
        <div
          className="w-full min-h-[400px] bg-gray-50 rounded-lg"
          dangerouslySetInnerHTML={{ __html: element.embed_code }}
        />
      );
    }

    if (element.url) {
      return (
        <div className="text-center py-8">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Launch the interactive activity in a new window</p>
          <Button
            onClick={() => {
              window.open(element.url, '_blank');
              setTimeout(() => onComplete && onComplete(), 2000);
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Interactive Activity
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={`shadow-lg ${isCompleted ? 'border-2 border-green-300' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{element.title}</h3>
              <Badge className="bg-purple-100 text-purple-800 mt-1">
                {typeLabels[element.type]}
              </Badge>
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        
        {element.description && (
          <p className="text-sm text-gray-600 mb-4">{element.description}</p>
        )}
        
        {renderElement()}
      </CardContent>
    </Card>
  );
}