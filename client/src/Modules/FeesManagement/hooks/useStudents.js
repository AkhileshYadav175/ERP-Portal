import { useState, useEffect, useCallback } from 'react';
import { feesApi } from '../../../api/feesApi';

/**
 * useStudents - Hook for fetching, registering, and editing student details.
 */
export const useStudents = (studentId = null) => {
  const [students, setStudents] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.getStudents();
      if (res.success) {
        setStudents(res.data.students || res.data || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch student profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.getStudentById(id);
      if (res.success) {
        setStudentProfile(res.data);
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError(err.response?.data?.message || 'Failed to fetch student details.');
    } finally {
      setLoading(false);
    }
  }, []);

  const registerStudent = async (studentData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.createStudent(studentData);
      return res;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register student.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editStudent = async (id, studentData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.updateStudent(id, studentData);
      if (res.success && studentProfile && studentProfile._id === id) {
        setStudentProfile(res.data);
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feesApi.deleteStudent(id);
      await fetchStudents();
      return res;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchProfile(studentId);
    } else {
      fetchStudents();
    }
  }, [studentId, fetchStudents, fetchProfile]);

  return {
    students,
    studentProfile,
    loading,
    error,
    refetchStudents: fetchStudents,
    refetchProfile: () => fetchProfile(studentId),
    registerStudent,
    editStudent,
    removeStudent
  };
};

export default useStudents;
