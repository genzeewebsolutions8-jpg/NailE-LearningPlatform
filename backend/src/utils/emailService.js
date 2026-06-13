const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send a 6-digit OTP email to the given address.
 * @param {string} toEmail - recipient email
 * @param {string} otp     - plain-text OTP to include in the email
 */
const sendOtpEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: `"Nail Academy" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your Nail Academy Email Verification Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #f0d6e8; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #e91e8c, #ff6eb4); padding: 28px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 1.5rem; letter-spacing: 1px;">💅 Nail Academy</h1>
            </div>
            <div style="padding: 32px;">
                <h2 style="color: #1a1a2e; margin-top: 0;">Verify Your Email Address</h2>
                <p style="color: #555; line-height: 1.6;">
                    Hi there! Use the code below to verify your email and complete your registration.
                    This code expires in <strong>10 minutes</strong>.
                </p>
                <div style="background: #f9f0f5; border: 2px dashed #e91e8c; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 2.5rem; font-weight: 900; letter-spacing: 10px; color: #e91e8c;">${otp}</span>
                </div>
                <p style="color: #888; font-size: 0.875rem;">
                    If you did not request this code, you can safely ignore this email.
                </p>
            </div>
            <div style="background: #fdf2f8; padding: 16px 32px; text-align: center; color: #aaa; font-size: 0.8rem;">
                © ${new Date().getFullYear()} Nail Academy. All rights reserved.
            </div>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

/**
 * Send a 6-digit password reset OTP email to the given address.
 * @param {string} toEmail - recipient email
 * @param {string} otp     - plain-text OTP to include in the email
 */
const sendResetPasswordEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: `"Nail Academy" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your Nail Academy Password Reset Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #f0d6e8; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #e91e8c, #ff6eb4); padding: 28px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 1.5rem; letter-spacing: 1px;">💅 Nail Academy</h1>
            </div>
            <div style="padding: 32px;">
                <h2 style="color: #1a1a2e; margin-top: 0;">Password Reset Request</h2>
                <p style="color: #555; line-height: 1.6;">
                    Hi there! We received a request to reset your password. Use the verification code below to reset your password.
                    This code expires in <strong>10 minutes</strong>.
                </p>
                <div style="background: #f9f0f5; border: 2px dashed #e91e8c; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 2.5rem; font-weight: 900; letter-spacing: 10px; color: #e91e8c;">${otp}</span>
                </div>
                <p style="color: #888; font-size: 0.875rem;">
                    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
            </div>
            <div style="background: #fdf2f8; padding: 16px 32px; text-align: center; color: #aaa; font-size: 0.8rem;">
                © ${new Date().getFullYear()} Nail Academy. All rights reserved.
            </div>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendResetPasswordEmail };

