const MailTypes = {
    AUTH: {
        REGISTER: {
            file: './src/mail/auth/register.html',
            subject: 'Willkommen  ',
        },
        RESET_PASSWORD: {
            file: './src/mail/auth/resetPassword.html'
        }
    }
}

module.exports = MailTypes