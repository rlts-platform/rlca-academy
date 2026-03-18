// src/components/ProfileSwitcher.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_CHILDREN_PER_PARENT = 10;

const AVATAR_COLORS = [
  { bg: '#1B3A5C', text: '#C5972B' },
  { bg: '#C5972B', text: '#FFFFFF' },
  { bg: '#2D6A4F', text: '#FFFFFF' },
  { bg: '#6B3FA0', text: '#FFFFFF' },
  { bg: '#C1440E', text: '#FFFFFF' },
  { bg: '#1A6B8A', text: '#FFFFFF' },
  { bg: '#8B2252', text: '#FFFFFF' },
  { bg: '#3D5A2E', text: '#FFFFFF' },
  { bg: '#4A3728', text: '#C5972B' },
  { bg: '#2C2C54', text: '#FFFFFF' },
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

// ─── Single profile card ──────────────────────────────────────────────────────
function ProfileCard({ child, index, onSelect, onEdit, isEditMode }) {
  const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const grade  = GRADE_LABELS[child.grade_level] || child.grade_level || '?';

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
      <div className="relative">
        <div
          className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg
                     transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {child.avatar_initials || getInitials(child.full_name)}
        </div>
        <div
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center
                     text-xs font-bold border-2 border-white shadow"
          style={{ backgroundColor: '#C5972B', color: '#FFFFFF' }}
        >
          {grade}
        </div>
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
      <div className="text-center">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {child.full_name?.split(' ')[0] || 'Student'}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{child.grade_level || 'Grade TBD'}</p>
        {child.enrollment_status && (
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${
            child.enrollment_status === 'Active'
              ? 'bg-green-100 text-green-700'
              : child.enrollment_status === 'Pending Review'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {child.enrollment_status}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Add child button ─────────────────────────────────────────────────────────
function AddProfileCard({ onClick, disabled }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center gap-3 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group'}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center
                      transition-all duration-200 group-hover:border-[#C5972B] group-hover:bg-amber-50">
        <Plus className="w-10 h-10 text-gray-300 group-hover:text-[#C5972B] transition-colors" />
      </div>
      <p className="text-sm text-gray-400 font-medium group-hover:text-[#C5972B] transition-colors">
        Add Child
      </p>
    </motion.div>
  );
}

// ─── Main ProfileSwitcher ─────────────────────────────────────────────────────
export default function ProfileSwitcher({ currentUser, onSelectChild, onAddChild, onEditChild }) {
  const [children, setChildren]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    loadChildren();
  }, [currentUser?.id]);

  const loadChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get family for this parent
      const { data: family, error: familyErr } = await supabase
        .from('families')
        .select('id')
        .eq('parent_id', currentUser.id)
        .single();

      if (familyErr && familyErr.code !== 'PGRST116') throw familyErr;

      if (!family) {
        setChildren([]);
        setLoading(false);
        return;
      }

      // Get children for this family
      const { data: kids, error: kidsErr } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', family.id)
        .order('created_at', { ascending: true });

      if (kidsErr) throw kidsErr;
      setChildren(kids || []);
    } catch (err) {
      console.error('[ProfileSwitcher] load error', err);
      setError('Failed to load profiles. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const atMax = children.length >= MAX_CHILDREN_PER_PARENT;
  const displayName = currentUser?.user_metadata?.full_name
    || currentUser?.email?.split('@')[0]
    || 'Parent';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, #0f1923 0%, #1B3A5C 50%, #0f1923 100%)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
             style={{ backgroundColor: '#C5972B' }}>
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">RLCA Academy</h1>
        <p className="text-gray-400 text-sm">Welcome back, {displayName}</p>
        {children.length > 0 && (
          <p className="text-gray-500 text-xs mt-2">
            Who's learning today?
          </p>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/40 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-[#C5972B] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading profiles...</span>
        </div>
      ) : (
        <>
          {/* Profile grid */}
          <div className="flex flex-wrap justify-center gap-8 mb-10 max-w-2xl">
            <AnimatePresence>
              {children.map((child, idx) => (
                <ProfileCard
                  key={child.id}
                  child={child}
                  index={idx}
                  onSelect={onSelectChild}
                  onEdit={onEditChild}
                  isEditMode={isEditMode}
                />
              ))}
            </AnimatePresence>

            {/* Add child button */}
            {!isEditMode && (
              <AddProfileCard onClick={onAddChild} disabled={atMax} />
            )}
          </div>

          {/* Empty state */}
          {children.length === 0 && !loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-sm mb-6 text-center"
            >
              No profiles yet. Add your first child to get started.
            </motion.p>
          )}

          {/* Max children notice */}
          {atMax && (
            <p className="text-gray-500 text-xs mb-6 text-center">
              Maximum of {MAX_CHILDREN_PER_PARENT} children reached.
            </p>
          )}

          {/* Edit mode toggle */}
          {children.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsEditMode(prev => !prev)}
              className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4"
            >
              {isEditMode ? 'Done editing' : 'Manage profiles'}
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}
