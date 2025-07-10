import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components2/ui/dialog';
import { createCourse, updateCourse, getCourseById } from '@/services/courses';
import { toast } from '@/components2/ui/use-toast';

export default function CreateCourseModal({ 
  open, 
  onClose, 
  courseId, 
  onCreated,
}) {
  const isEditing = Boolean(courseId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoaded, setInitLoaded] = useState(false);
  const school_id = 1;

  // Load data when modal opens and editing
  useEffect(() => {
    const loadCourseData = async () => {
      if (isEditing && open) {
        try {
          setLoading(true);
          const res = await getCourseById(courseId);
          if (res?.data) {
            setTitle(res.data.title || '');
            setDescription(res.data.description || '');
          } else {
            throw new Error('Course data not found');
          }
        } catch (error) {
          console.error('Failed to fetch course:', error);
          toast(
           'Error',
            {description: 'Failed to load course data',
    
          });
          onClose();
        } finally {
          setLoading(false);
          setInitLoaded(true);
        }
      } else {
        setInitLoaded(true);
      }
    };

    loadCourseData();
  }, [courseId, open, isEditing]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setInitLoaded(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      if (isEditing) {
        await updateCourse(courseId, { title, description });
        toast(
      'Success',
      { description: `"${title}" has been updated successfully.`
        });
        onClose();
      } else {
        const res = await createCourse({ school_id, title, description });
        
        // Updated to match your API response structure
        const newCourseId = res?.data?.course_id;
        
        if (!newCourseId) {
          console.error('API Response:', res);
          throw new Error('Course was created but no ID was returned in response');
        }

        toast(
         'Success',
         { description: `"${title}" has been created successfully.`
        });
        
        if (onCreated) {
          onCreated(newCourseId);
        }
        
        onClose();
      }
    } catch (err) {
      console.error('Failed to save course:', err);
      toast(
     'Error',
     { description: err.message || 'Failed to save course. Please try again.',
        
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Course' : 'Create New Course'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your course details below.' : 'Create a new course by filling the details below.'}
            <br />
            <strong>All fields are required.</strong>
          </DialogDescription>
        </DialogHeader>

        {!initLoaded ? (
          <div className="text-center text-sm text-muted">Loading course data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Course Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
              disabled={loading}
            />
            <textarea
              placeholder="Course Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
              rows={4}
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}