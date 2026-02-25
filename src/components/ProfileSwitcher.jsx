import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, BookOpen, Star, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MAX_CHILDREN_PER_PARENT } from '@/lib/roles';

// ─── Avatar color palette (one per child slot) ───────────────────────────────
const AVATAR_COLORS = [
  { bg: '#1B3A5C', text: '#C5972B' }, // navy / gold
  { bg: '#C5972B', text: '#FFFFFF' }, // gold / white
  { bg: '#2D6A4F', text: '#FFFFFF' }, // forest green
  { bg: '#6B3FA0', text: '#FFFFFF' }, // purple
  { bg: '#C1440E', text: '#FFFFFF' }, // burnt orange
  { bg: '#1A6B8A', text: '#FFFFFF' }, // teal
  { bg: '#8B2252', text: '#FFFFFF' }, // crimson
  { bg: '#3D5A2E', text: '#FFFFFF' }, // dark green
  { bg: '#4A3728', text: '#C5972B' }, // brown / gold
  { bg: '#2C2C54', text: '#FFFFFF' }, // midnight
];

const GRADE_LABELS = {
  'Kindergarten': 'K', '1st Grade': '1', '2nd Grade': '2', '3rd Grade': '3',
  '4th Grade': '4', '5th Grade': '5', '6th Grade': '6', '7th Grade': '7',
  '8th Grade': '8', '9th Grade': '9', '10th Grade': '10', '11th Grade': '11',
  '12th Grade': '12',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Single profile card ─────────────────────────────────────────────────────
function ProfileCard({ child, index, onSelect, onEdit, isEditMode }) {
  const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const grade = GRADE_LABELS[child.grade_level] || child.grade_level || '?';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="relative flex flex-col items-center gap-3 cursor-pointer group"
      onClick={() => isEditMode ? onEdit(child) : onSelect(child)}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg
                     transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {getInitials(child.full_name)}
        </div>

        {/* Grade badge */}
        <div
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center
                     text-xs font-bold border-2 border-white shadow"
          style={{ backgroundColor: '#C5972B', color: '#FFFFFF' }}
        >
          {grade}
        </div>

        {/* Edit overlay */}
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"
          >
            <Pencil className="w-7 h-7 text-white" />
          </motion.div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {child.full_name?.split(' ')[0] || 'Student'}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{child.grade_level || 'Grade TBD'}</p>
      </div>
    </motion.div>
  );
}

// ─── Add child card ───────────────────────────────────────────────────────────
function AddChildCard({ onClick, disabled }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center gap-3 cursor-pointer group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center
                   transition-all duration-200 group-hover:border-[#C5972B] group-hover:bg-amber-50 group-hover:scale-105"
      >
        <Plus className="w-10 h-10 text-gray-400 group-hover:text-[#C5972B] transition-colors" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-500 text-sm group-hover:text-[#C5972B] transition-colors">
          Add Child
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{disabled ? 'Max 10 reached' : 'New profile'}</p>
      </div>
    </motion.div>
  );
}

// ─── Main ProfileSwitcher component ──────────────────────────────────────────
export default function ProfileSwitcher({ currentUser, onSelectChild, onAddChild, onEditChild }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChildren();
  }, [currentUser]);

  const loadChildren = async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      const students = await base44.entities.Student.filter({
        parent_email: currentUser.email
      });
      // Sort by creation order
      setChildren(students || []);
    } catch (err) {
      console.error('[ProfileSwitcher] Failed to load children:', err);
      setError('Could not load profiles. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const atMax = children.length >= MAX_CHILDREN_PER_PARENT;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #0f1923 0%, #1B3A5C 50%, #0f1923 100%)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#C5972B] border-t-transparent rounded-full animate-spin mx-auto mb-4"
               style={{ borderWidth: 3 }} />
          <p className="text-gray-400 text-sm">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, #0f1923 0%, #1B3A5C 60%, #0f1923 100%)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12"
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: '#C5972B' }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-wide">RLCA Academy</span>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">
          Who's learning today?
        </h1>
        <p className="text-gray-400 text-base">
          Select a profile to enter the academy
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-8 px-4 py-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Profile grid */}
      <motion.div
        layout
        className="flex flex-wrap items-center justify-center gap-8 max-w-2xl mb-12"
      >
        <AnimatePresence>
          {children.map((child, i) => (
            <ProfileCard
              key={child.id}
              child={child}
              index={i}
              onSelect={onSelectChild}
              onEdit={onEditChild}
              isEditMode={isEditMode}
            />
          ))}
        </AnimatePresence>

        {/* Add child card */}
        <AddChildCard
          onClick={onAddChild}
          disabled={atMax}
        />
      </motion.div>

      {/* Edit / Done toggle */}
      {children.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsEditMode(!isEditMode)}
          className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
        >
          {isEditMode ? 'Done editing' : 'Manage profiles'}
        </motion.button>
      )}

      {/* Parent info footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex items-center gap-2 text-gray-500 text-xs"
      >
        <Star className="w-3 h-3" style={{ color: '#C5972B' }} />
        <span>Signed in as {currentUser?.email}</span>
        <span>·</span>
        <span>{children.length}/{MAX_CHILDREN_PER_PARENT} profiles</span>
      </motion.div>
    </div>
  );
}
