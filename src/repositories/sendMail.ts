import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendEmail(email: string, name: string, subject: string, html: string) {
    try {

        const msg: sgMail.MailDataRequired = {
            to: email,
            from: process.env.MAIL_FROM ?? '',
            subject: subject,
            html: html,
        };

        await sgMail.send(msg);
        console.log('✅ Email berhasil dikirim!');
    } catch (error: any) {
        console.error('❌ Gagal kirim email:', error.response?.body || error.message);
    }
}

export function templateMail (greeting: string , content: string , button: string , url: string , closing: string) {
        const message = `
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="font-family: Open Sans, sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:50px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" cellpadding="0" cellspacing="0"
                                    style="max-width:670px; background:#fff; border-radius:3px; box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;"><b>${greeting}</b></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;">${content}</p>
                                        </td>
                                    </tr>${button ?
                                    `<tr>
                                        <td style="padding: 40px 35px; text-align: center;">
                                            <a href="${url}" style="border-radius: 4px; color: #fff; padding: 8px 18px; text-decoration: none; background-color: #2d3748;"
                                            target="_blank" rel="noopener">${button}</a>
                                        </td>
                                    </tr>` : ''
                                    }
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <p style="font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;">${closing}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>`;

        return message;
    }
