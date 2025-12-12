import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Heart, Users, Sparkles, Target, Brain, Award, Globe, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from '@/api/base44Client';

export default function HomePage() {

  const features = [
    {
      icon: BookOpen,
      title: 'Personalized Curriculum',
      description: 'AI-powered learning paths adapted to each child\'s unique needs and pace',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'Biblical Foundation',
      description: 'Character development rooted in faith, wisdom, and timeless values',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'AI Tutor Support',
      description: '24/7 intelligent tutoring in every subject with personalized guidance',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Target,
      title: 'Project-Based Learning',
      description: 'Real-world projects that develop critical thinking and problem-solving',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Award,
      title: 'Gamified Progress',
      description: 'Engaging quests, badges, and rewards that motivate excellence',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Globe,
      title: 'Entrepreneurship Focus',
      description: 'Building future leaders with business skills and innovative thinking',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  const values = [
    { title: 'Excellence', description: 'Pursuing mastery in all areas of learning and character' },
    { title: 'Integrity', description: 'Developing honest, trustworthy leaders of tomorrow' },
    { title: 'Wisdom', description: 'Teaching discernment and sound judgment grounded in truth' },
    { title: 'Leadership', description: 'Empowering students to lead with courage and compassion' },
    { title: 'Creativity', description: 'Fostering innovation and original thinking' },
    { title: 'Stewardship', description: 'Teaching responsibility and care for God\'s creation' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                Royal Legends Children Academy
              </span>
            </h1>
            <p className="text-3xl font-semibold text-gray-800 mb-4">Raising Excellent Leaders</p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A faith-based homeschool academy that combines deep biblical education with cutting-edge AI technology, 
              personalized learning, and real-world skills to prepare your children for extraordinary futures.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">K-12</div>
              <div className="text-gray-600">Complete Curriculum</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">AI Tutor Access</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-pink-600 mb-2">100%</div>
              <div className="text-gray-600">Faith-Centered</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-amber-600 mb-2">Flexible</div>
              <div className="text-gray-600">Schedule Options</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Portal */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Begin Your Journey</h2>
            <p className="text-lg text-gray-600">Access your personalized learning portal</p>
          </div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-2xl hover:shadow-3xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <CardTitle className="text-center">New Family</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Start with our student placement questionnaire to find the perfect grade level and learning path.
                </p>
                <Button
                  onClick={() => base44.auth.redirectToLogin(window.location.origin + '/StudentOnboarding')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-2xl hover:shadow-3xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <CardTitle className="text-center">Returning Family</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Sign in to access your dashboard, view progress, and continue your learning journey.
                </p>
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  size="lg"
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Why Choose Royal Legends?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We combine time-tested educational principles with modern technology to create an unparalleled learning experience
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="bg-white/60 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              These principles guide everything we do, from curriculum design to student interactions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-lg border-2 border-purple-200"
                >
                  <h3 className="text-xl font-bold text-purple-700 mb-2">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Schedule Options Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Flexible Learning Options</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the schedule that works best for your family's unique needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-xl border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <CardTitle className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  Full-Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center text-gray-700 mb-4">Complete comprehensive education</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Monday-Friday, 9 AM - 2:30 PM</li>
                  <li>✓ All core subjects covered</li>
                  <li>✓ 36-week curriculum</li>
                  <li>✓ Full academic year</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardTitle className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  Part-Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center text-gray-700 mb-4">Balanced learning approach</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ 4 days per week</li>
                  <li>✓ Core subjects focus</li>
                  <li>✓ Flexible project days</li>
                  <li>✓ Parent-guided enrichment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2 border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <CardTitle className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  Self-Paced
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center text-gray-700 mb-4">Maximum flexibility</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Learn on your schedule</li>
                  <li>✓ Access 24/7</li>
                  <li>✓ Accelerated options</li>
                  <li>✓ AI tutor support anytime</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Child's Education?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join families who are raising the next generation of excellent leaders
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.origin + '/StudentOnboarding')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Free Assessment
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}