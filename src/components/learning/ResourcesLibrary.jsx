import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Video, FileText, Link as LinkIcon, Search, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function ResourcesLibrary({ resources }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!resources || resources.length === 0) return null;

  const typeIcons = {
    "Video": <Video className="w-5 h-5" />,
    "Article": <FileText className="w-5 h-5" />,
    "Interactive": <LinkIcon className="w-5 h-5" />,
    "Book": <BookOpen className="w-5 h-5" />,
    "Worksheet": <FileText className="w-5 h-5" />,
    "Game": <LinkIcon className="w-5 h-5" />
  };

  const typeColors = {
    "Video": "bg-red-100 text-red-800 border-red-200",
    "Article": "bg-blue-100 text-blue-800 border-blue-200",
    "Interactive": "bg-purple-100 text-purple-800 border-purple-200",
    "Book": "bg-green-100 text-green-800 border-green-200",
    "Worksheet": "bg-amber-100 text-amber-800 border-amber-200",
    "Game": "bg-pink-100 text-pink-800 border-pink-200"
  };

  const filteredResources = resources.filter(resource =>
    resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-green-900">
          <BookOpen className="w-6 h-6" />
          Recommended Learning Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => resource.url && window.open(resource.url, '_blank')}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                  {typeIcons[resource.type] || <BookOpen className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                      {resource.title}
                    </h3>
                    {resource.url && (
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={`${typeColors[resource.type] || "bg-gray-100 text-gray-800"} border text-xs`}>
                      {resource.type}
                    </Badge>
                    {resource.subject && (
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                    )}
                  </div>

                  {resource.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No resources match your search
          </div>
        )}
      </CardContent>
    </Card>
  );
}