import { sendEmail, templateMail } from "../repositories/sendMail";

class RegistrationNotification {
    send(email: string, name: string, token: string): void {
        const url = this.url(name, email, token);
        const button = this.button();
        const greeting = this.greeting(name);
        const content = this.content(token);
        const closing = this.closing();

        const subject = 'Kode Verifikasi Pendaftaran Anda!';
        const html = templateMail(greeting, content, button, url, closing);

        sendEmail(email, name, subject, html);
    }

    private url(name: string, email: string, token: string): string {
        return `${process.env.FRONTEND_URL}/verification?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    }

    private button(): string {
        return '';
    }

    private greeting(firstname: string): string {
        return `Halo ${firstname}!`;
    }

    private content(otp: string): string {
        return `Terima kasih telah mendaftar. <br><br>
        Untuk menyelesaikan proses registrasi, silakan masukkan kode verifikasi (OTP) berikut:<br><br>
        <center><strong style="font-size: 22px; letter-spacing: 2px;text-align: center;">${otp}</strong></center><br><br>
        Kode ini hanya berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`;
    }

    private closing(): string {
        return `Harap jangan ragu untuk menghubungi kami jika Anda memiliki pertanyaan.<br>`;
    }
}

export default new RegistrationNotification();
