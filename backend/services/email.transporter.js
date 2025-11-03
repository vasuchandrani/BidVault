import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "bidvault.auction@gmail.com",
        pass: "hihh efwp nuka gtbk"
    }
});

export default transporter;