const Certificate = require('../../models/Certificate');

// @desc    Create a new certificate
// @route   POST /api/certificates
// @access  Private (Admin)
exports.createCertificate = async (req, res, next) => {
  try {
    const {
      studentName,
      enrollmentNumber,
      course,
      courseIssueDate,
      duration,
      internship,
      internshipDuration,
      issueDate
    } = req.body;

    if (!studentName || !enrollmentNumber || !course || !courseIssueDate || !duration || !internship || !issueDate) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    // Check duplicate enrollment number
    const existing = await Certificate.findOne({ enrollmentNumber: enrollmentNumber.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A certificate with this enrollment number already exists.' });
    }

    const certificate = await Certificate.create({
      studentName: studentName.trim(),
      enrollmentNumber: enrollmentNumber.trim(),
      course: course.trim(),
      courseIssueDate: courseIssueDate.trim(),
      duration: duration.trim(),
      internship,
      internshipDuration: internshipDuration ? internshipDuration.trim() : '',
      issueDate: issueDate.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate created successfully.',
      data: certificate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private (Admin)
exports.getCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: certificates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private (Admin)
exports.updateCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate record not found.' });
    }

    const {
      studentName,
      enrollmentNumber,
      course,
      courseIssueDate,
      duration,
      internship,
      internshipDuration,
      issueDate
    } = req.body;

    // Check duplicate if enrollment number changes
    if (enrollmentNumber && enrollmentNumber.trim() !== certificate.enrollmentNumber) {
      const existing = await Certificate.findOne({ enrollmentNumber: enrollmentNumber.trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'A certificate with this enrollment number already exists.' });
      }
      certificate.enrollmentNumber = enrollmentNumber.trim();
    }

    if (studentName) certificate.studentName = studentName.trim();
    if (course) certificate.course = course.trim();
    if (courseIssueDate) certificate.courseIssueDate = courseIssueDate.trim();
    if (duration) certificate.duration = duration.trim();
    if (internship) certificate.internship = internship;
    if (internshipDuration !== undefined) certificate.internshipDuration = internshipDuration.trim();
    if (issueDate) certificate.issueDate = issueDate.trim();

    await certificate.save();

    return res.status(200).json({
      success: true,
      message: 'Certificate details updated successfully.',
      data: certificate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private (Admin)
exports.deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate record not found.' });
    }

    await Certificate.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify a certificate (Public)
// @route   GET /api/certificates/verify
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { enrollmentNumber } = req.query;
    if (!enrollmentNumber) {
      return res.status(400).json({ success: false, message: 'Please specify the enrollment number to verify.' });
    }

    // Exact search or normalized search
    const cleanEnroll = enrollmentNumber.trim().toUpperCase();
    const certificate = await Certificate.findOne({
      enrollmentNumber: { $regex: new RegExp('^' + cleanEnroll.replace(/\//g, '\\/') + '$', 'i') }
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'No certificate found matching the provided enrollment number.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Certificate verified successfully. ✅',
      data: certificate
    });
  } catch (err) {
    next(err);
  }
};
