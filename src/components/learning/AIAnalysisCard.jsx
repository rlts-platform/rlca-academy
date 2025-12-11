import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, Lightbulb, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function AIAnalysisCard({ analysis }) {
  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="border-b bg-gradient-to-r from-purple-100 to-blue-100">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Brain className="w-6 h-6" />
            AI Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Overall Summary */}
          {analysis.overall_summary && (
            <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Overall Assessment</h3>
                  <p className="text-gray-700">{analysis.overall_summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Learning Style */}
          {analysis.learning_style && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Learning Style</div>
                <div className="font-semibold text-gray-900">{analysis.learning_style}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Strengths</h3>
                </div>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{strength}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Focus Areas</h3>
                </div>
                <div className="space-y-2">
                  {analysis.areas_for_improvement.map((area, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{area}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}