import api from './api';

const saveReport = (role, data) => {
    return api.post('/reports/save', {
        role,
        ...data
    });
};

const getUserReports = (role = null) => {
    const params = role ? `?role=${role}` : '';
    return api.get(`/reports${params}`);
};

const getReportStats = (role = null) => {
    const params = role ? `?role=${role}` : '';
    return api.get(`/reports/stats${params}`);
};

const cleanupReports = () => {
    return api.post('/reports/cleanup');
};

const ReportService = {
    saveReport,
    getUserReports,
    getReportStats,
    cleanupReports
};

export default ReportService;
