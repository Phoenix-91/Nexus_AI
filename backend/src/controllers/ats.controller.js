import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import ATSReport from '../models/atsReport.model.js';
import { extractTextFromPDF, analyzeWithAI } from '../services/ats.service.js';

const AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Analyze resume - tries Python service first, falls back to Node.js service
export const analyzeResume = async (req, res) => {
    try {
        const { jobRole } = req.body;
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({ success: false, error: 'No resume file uploaded' });
        }
        if (!jobRole) {
            return res.status(400).json({ success: false, error: 'Job role is required' });
        }

        console.log('📄 Analyzing resume for role:', jobRole);

        let analysis;

        try {
            // --- Try Python AI service first (enhanced analysis) ---
            console.log('🐍 Forwarding to Python AI service...');
            const formData = new FormData();
            formData.append('file', fs.createReadStream(resumeFile.path), {
                filename: resumeFile.originalname || 'resume.pdf',
                contentType: 'application/pdf',
            });
            formData.append('jobRole', jobRole);

            const pyResponse = await axios.post(
                `${AI_SERVICE_URL}/ai/analyze-ats`,
                formData,
                { headers: formData.getHeaders(), timeout: 60000 }
            );

            analysis = pyResponse.data.analysis;
            console.log('✅ Python service analysis complete. Score:', analysis.atsScore);

        } catch (pyErr) {
            // --- Fallback to Node.js Groq analysis ---
            console.warn('⚠️  Python service unavailable, falling back to Node.js analysis:', pyErr.message);
            const resumeText = await extractTextFromPDF(resumeFile.path);
            analysis = await analyzeWithAI(resumeText, jobRole);
        }

        // Save report to MongoDB
        const report = new ATSReport({
            jobRole,
            ...analysis,
            createdAt: new Date()
        });
        await report.save();

        // Clean up uploaded file
        try { fs.unlinkSync(resumeFile.path); } catch (_) { /* ignore */ }

        console.log('✅ Report saved. ID:', report._id);
        res.json({ success: true, reportId: report._id });

    } catch (error) {
        console.error('❌ ATS analysis error:', error);
        if (req.file) { try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ } }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get report by ID
export const getReport = async (req, res) => {
    try {
        const report = await ATSReport.findById(req.params.reportId);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        res.json({ success: true, report });
    } catch (error) {
        console.error('❌ Get report error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Download report as PDF
export const downloadReport = async (req, res) => {
    try {
        const report = await ATSReport.findById(req.params.reportId);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ATS_Report_${req.params.reportId}.pdf`);
        doc.pipe(res);

        doc.fontSize(26).fillColor('#7c3aed').text('ATS Analysis Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#6b7280').text(`Job Role: ${report.jobRole}`, { align: 'center' });
        doc.fontSize(12).text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(1);

        doc.fontSize(20).fillColor('#111827').text(`Overall ATS Score: ${report.atsScore}/100`);
        doc.fontSize(14).fillColor('#6b7280').text(`Verdict: ${report.verdict}`);
        doc.moveDown(1);

        doc.fontSize(16).fillColor('#111827').text('Category Scores:');
        doc.fontSize(12).fillColor('#374151')
            .text(`• Keywords: ${report.keywordScore}/100`)
            .text(`• Format: ${report.formatScore}/100`)
            .text(`• Experience: ${report.experienceScore}/100`)
            .text(`• Skills: ${report.skillsScore}/100`);
        doc.moveDown(1);

        doc.fontSize(16).fillColor('#111827').text('Missing Keywords:');
        (report.missingKeywords || []).forEach(kw => doc.fontSize(12).fillColor('#ef4444').text(`• ${kw}`));
        doc.moveDown(1);

        doc.fontSize(16).fillColor('#111827').text('Found Keywords:');
        (report.foundKeywords || []).forEach(kw => doc.fontSize(12).fillColor('#10b981').text(`• ${kw}`));
        doc.moveDown(1);

        doc.fontSize(16).fillColor('#111827').text('AI Suggestions:');
        (report.suggestions || []).forEach(s => {
            doc.fontSize(13).fillColor('#374151').text(s.title);
            doc.fontSize(11).fillColor('#6b7280').text(`  ${s.description}`);
            doc.moveDown(0.3);
        });
        doc.moveDown(0.5);

        doc.fontSize(16).fillColor('#111827').text('Detailed Analysis:');
        doc.fontSize(12).fillColor('#374151').text(report.detailedAnalysis, { align: 'justify' });

        doc.end();

    } catch (error) {
        console.error('❌ Download error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
