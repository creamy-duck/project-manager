const nodemailer = require('nodemailer');
const { AppError, ErrorCodes } = require('../errors');
const { MailTypes } = require('../mail/mails');
const fs = require("node:fs");

class MailService {

    async createMail(user, message, params) {

        let html = this.processHTMLFile(message.file, params);

        let infos = {
            email: user.email,
            subject: message.subject,
            content: html
        }

        this.sendMail(infos)

    }

    sendMail(infos) {
        try {
            const transporter = this.getTransport();
            transporter.sendMail({
                from: process.env.FROM_EMAIL,
                to: infos.email,
                subject: infos.subject,
                html: infos.content
            })
        } catch (e) {
            throw new AppError(ErrorCodes.SERVER.EMAIL)
        }
    }

    getTransport() {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        })

        return transporter;
    }

    processHTMLFile(file, params) {
        let content = fs.readFileSync(file, 'utf8');

        for (const key in params) {
            const regex = new RegExp(`{{${key}}}`, 'g'); // global alle Vorkommen
            content = content.replace(regex, params[key]);
        }

        return content;
    }

}

module.exports = new MailService();