// src/pages/GetStarted.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Sparkles, Users, BookOpen, Heart, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabase';

export default function GetStarted() {
  const [mode, setMode]         = useState('signup'); // 'signup' | 'signin'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'parent' } },
      });
      if (signUpError) throw signUpError;
      window.location.href = '/StudentOnboarding';
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      window.location.href = '/StudentOnboarding';
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen,  title: 'Personalized Curriculum', description: 'AI-powered learning paths tailored to your child' },
    { icon: Heart,     title: 'Biblical Foundation',      description: 'Character development rooted in faith and wisdom' },
    { icon: Users,     title: 'Flexible Schedule',        description: 'Full-time, part-time, or self-paced options' },
    { icon: Sparkles,  title: 'Excellence & Leadership',  description: 'Developing future leaders with real-world skills' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left — Hero */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Royal Legends Children Academy
              </h1>
              <p className="text-gray-600">Raising Excellent Leaders</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Excellence in Education</h2>
          <p className="text-lg text-gray-700 mb-8">
            A faith-based homeschool academy focused on deep learning, character development,
            and preparing leaders for tomorrow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} className="p-4 bg-white rounded-xl shadow-md">
                  <Icon className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right — Auth form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
          <Card className="shadow-2xl w-full">
            <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="text-2xl text-center">
                {mode === 'signup' ? 'Begin Enrollment' : 'Welcome Back'}
              </CardTitle>
              <p className="text-center text-sm opacity-90 mt-2">
                {mode === 'signup'
                  ? "Create your secure RLCA parent account and start your child's enrollment application."
                  : 'Sign in to continue your enrollment or access your dashboard.'}
              </p>
            </CardHeader>
            <CardContent className="p-6">

              {/* Mode toggle */}
              <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'signup' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => { setMode('signin'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'signin' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <Label>Parent/Guardian Full Name</Label>
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    required
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {loading
                    ? (mode === 'signup' ? 'Creating account...' : 'Signing in...')
                    : (mode === 'signup' ? 'Create Account & Begin Enrollment' : 'Sign In')}
                </Button>
              </form>

              {mode === 'signup' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    <strong>Next Step:</strong> After creating your account, you'll complete a brief
                    enrollment and placement application so we can create your student's official record.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}