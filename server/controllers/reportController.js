const Report = require('../models/Report');

/**
 * Save a report (Sender or Receiver)
 */
exports.saveReport = async (req, res) => {
    try {
        const userId = req.userId;
        const { role, genTime, encTime, cloudExecTime, decPhase1Time, decPhase2Time, decTime } = req.body;

        if (!role || !['Sender', 'Receiver'].includes(role)) {
            return res.status(400).send({ message: "Invalid role. Must be 'Sender' or 'Receiver'" });
        }

        // Validate that required timing data is present
        if (role === 'Sender') {
            if (genTime === undefined || encTime === undefined || cloudExecTime === undefined) {
                return res.status(400).send({ message: "Sender report requires genTime, encTime, and cloudExecTime" });
            }
        } else if (role === 'Receiver') {
            if (decPhase1Time === undefined || decPhase2Time === undefined || decTime === undefined) {
                return res.status(400).send({ message: "Receiver report requires decPhase1Time, decPhase2Time, and decTime" });
            }
        }

        const report = await Report.create({
            userId,
            role,
            genTime,
            encTime,
            cloudExecTime,
            decPhase1Time,
            decPhase2Time,
            decTime,
            timestamp: new Date()
        });

        res.send({
            message: "Report saved successfully",
            report
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

/**
 * Get all reports for the current user, optionally filtered by role
 */
exports.getUserReports = async (req, res) => {
    try {
        const userId = req.userId;
        const { role } = req.query;

        const query = { userId };
        
        if (role && ['Sender', 'Receiver'].includes(role)) {
            query.role = role;
        }

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .limit(50); // Return last 50 reports

        res.send({
            count: reports.length,
            reports
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

/**
 * Get report statistics for the current user
 */
exports.getReportStats = async (req, res) => {
    try {
        const userId = req.userId;
        const { role } = req.query;

        const query = { userId };
        if (role && ['Sender', 'Receiver'].includes(role)) {
            query.role = role;
        }

        const reports = await Report.find(query);

        if (reports.length === 0) {
            return res.send({
                count: 0,
                averages: {},
                totals: {},
                message: "No reports found"
            });
        }

        let stats = {};

        if (reports[0].role === 'Sender') {
            stats = {
                count: reports.length,
                averages: {
                    genTime: (reports.reduce((acc, r) => acc + (r.genTime || 0), 0) / reports.length).toFixed(2),
                    encTime: (reports.reduce((acc, r) => acc + (r.encTime || 0), 0) / reports.length).toFixed(2),
                    cloudExecTime: (reports.reduce((acc, r) => acc + (r.cloudExecTime || 0), 0) / reports.length).toFixed(2)
                },
                totals: {
                    genTime: reports.reduce((acc, r) => acc + (r.genTime || 0), 0).toFixed(2),
                    encTime: reports.reduce((acc, r) => acc + (r.encTime || 0), 0).toFixed(2),
                    cloudExecTime: reports.reduce((acc, r) => acc + (r.cloudExecTime || 0), 0).toFixed(2)
                }
            };
        } else {
            stats = {
                count: reports.length,
                averages: {
                    decPhase1Time: (reports.reduce((acc, r) => acc + (r.decPhase1Time || 0), 0) / reports.length).toFixed(2),
                    decPhase2Time: (reports.reduce((acc, r) => acc + (r.decPhase2Time || 0), 0) / reports.length).toFixed(2),
                    decTime: (reports.reduce((acc, r) => acc + (r.decTime || 0), 0) / reports.length).toFixed(2)
                },
                totals: {
                    decPhase1Time: reports.reduce((acc, r) => acc + (r.decPhase1Time || 0), 0).toFixed(2),
                    decPhase2Time: reports.reduce((acc, r) => acc + (r.decPhase2Time || 0), 0).toFixed(2),
                    decTime: reports.reduce((acc, r) => acc + (r.decTime || 0), 0).toFixed(2)
                }
            };
        }

        res.send(stats);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

/**
 * Delete old reports (keep only last 100 per user)
 */
exports.cleanupReports = async (req, res) => {
    try {
        const userId = req.userId;
        
        const reports = await Report.find({ userId })
            .sort({ createdAt: -1 })
            .skip(100);

        if (reports.length > 0) {
            const idsToDelete = reports.map(r => r._id);
            await Report.deleteMany({ _id: { $in: idsToDelete } });
        }

        res.send({
            message: "Cleanup completed",
            deletedCount: reports.length
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
