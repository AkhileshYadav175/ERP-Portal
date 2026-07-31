import { useState, useEffect, useCallback } from 'react';
import { feesApi } from '../../../api/feesApi';

/**
 * useDashboard - Hook for dashboard metrics, graphs, lists, and activity logs.
 */
export const useDashboard = (filterType, customRange, isApplyingCustom) => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [upcomingDues, setUpcomingDues] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [timelineActivities, setTimelineActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryParams = { filterType };
      if (filterType === 'custom') {
        summaryParams.startDate = customRange.startDate;
        summaryParams.endDate = customRange.endDate;
      }

      const [
        summaryRes,
        chartsRes,
        paymentsRes,
        upcomingRes,
        overdueRes,
        studentsRes,
        activitiesRes
      ] = await Promise.all([
        feesApi.getDashboardSummary(summaryParams),
        feesApi.getDashboardCharts(summaryParams),
        feesApi.getDashboardRecentPayments(),
        feesApi.getDashboardUpcomingDue(),
        feesApi.getDashboardOverdue(),
        feesApi.getDashboardRecentStudents(),
        feesApi.getDashboardRecentActivities()
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (chartsRes.success) setCharts(chartsRes.data);
      if (paymentsRes.success) setRecentPayments(paymentsRes.data || []);
      if (upcomingRes.success) setUpcomingDues(upcomingRes.data || []);
      if (overdueRes.success) setOverdueList(overdueRes.data || []);
      if (studentsRes.success) setRecentStudents(studentsRes.data || []);
      if (activitiesRes.success) setTimelineActivities(activitiesRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to sync live dashboard panels.');
    } finally {
      setLoading(false);
    }
  }, [filterType, customRange, isApplyingCustom]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    summary,
    charts,
    recentPayments,
    upcomingDues,
    overdueList,
    recentStudents,
    timelineActivities,
    loading,
    error,
    refetch: fetchDashboardData
  };
};

export default useDashboard;
