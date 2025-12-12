import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, FileText, Headphones, CheckCircle } from "lucide-react";

export default function MediaEmbed({ media, onComplete, isCompleted }) {
  const [videoProgress, setVideoProgress] = useState(0);

  const getEmbedUrl = (url, type) => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  const renderMedia = () => {
    switch (media.type) {
      case 'youtube':
      case 'vimeo':
      case 'video':
        return (
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={getEmbedUrl(media.url, media.type)}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => {
                // Mark as completed when loaded and played
                setTimeout(() => onComplete && onComplete(), 5000);
              }}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gray-100 p-6 rounded-lg">
            <audio
              controls
              className="w-full"
              onEnded={() => onComplete && onComplete()}
            >
              <source src={media.url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <div className="border-2 border-gray-200 rounded-lg p-4 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onComplete && onComplete()}
              className="text-blue-600 hover:underline font-semibold"
            >
              Open PDF Document
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (media.type) {
      case 'youtube':
      case 'vimeo':
      case 'video':
        return <PlayCircle className="w-5 h-5" />;
      case 'audio':
        return <Headphones className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      default:
        return <PlayCircle className="w-5 h-5" />;
    }
  };

  return (
    <Card className={`shadow-md ${isCompleted ? 'border-2 border-green-300' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h3 className="font-semibold text-gray-900">{media.title}</h3>
              {media.description && (
                <p className="text-sm text-gray-600">{media.description}</p>
              )}
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        {renderMedia()}
      </CardContent>
    </Card>
  );
}