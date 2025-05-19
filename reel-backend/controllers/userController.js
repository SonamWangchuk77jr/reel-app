const User = require('../models/User');
const ForgotPassword = require('../models/ForgotPassword');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
};

exports.totalUsers = async (req, res) => {
    const totalUsers = await User.countDocuments();
    res.status(200).json({totalUsers});
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(id, { name, email }, { new: true });
    res.status(200).json(user);
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'The email you entered is not associated with any account.' });
    }
    // Generate and store confirmation code of 6 digits
    const confirmationCode = Math.floor(100000 + Math.random() * 900000);
    await ForgotPassword.deleteMany({ userId: user._id }); // Remove old codes
    await ForgotPassword.create({ userId: user._id, confirmationCode });
    // Send email
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset',
        text: `Your password confirmation code is: ${confirmationCode}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email error:', error);
            return res.status(500).json({ message: 'Failed to send email' });
        }
        res.status(200).json({ message: 'Password reset email sent' });
    });
};

exports.resetPasswordConfirmationCode = async (req, res) => {
    const { email, confirmationCode } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'The email you entered is not associated with any account.' });
    }
    const codeEntry = await ForgotPassword.findOne({ userId: user._id, confirmationCode: Number(confirmationCode) });
    if (!codeEntry) {
        return res.status(401).json({ message: 'Invalid code' });
    }
    if (codeEntry.expiresAt < new Date()) {
        return res.status(401).json({ message: 'Code expired' });
    }
    res.status(200).json({ message: 'Password confirmed' });
};

exports.resetPassword = async (req, res) => {
    const { email, newPassword, confirmationCode } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'The email you entered is not associated with any account.' });
    }
    // Optionally require confirmationCode for extra security
    if (confirmationCode) {
        const codeEntry = await ForgotPassword.findOne({ userId: user._id, confirmationCode: Number(confirmationCode) });
        if (!codeEntry) {
            return res.status(401).json({ message: 'Invalid code' });
        }
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    // Clean up used code
    await ForgotPassword.deleteMany({ userId: user._id });
    res.status(200).json({ message: 'Password reset successfully' });
};




