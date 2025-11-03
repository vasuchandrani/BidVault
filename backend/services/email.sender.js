import transporter from "./email.transporter.js";
import { Verification_Email_Template, Welcome_Email_Template, Outbid_Email_Template, } from "./email.template.js";

const SendVerificationCode = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: "bidvault.auction@gmail.com",
      to: email,
      subject: "Verify your Email, Welcome to BidVault",
      html: Verification_Email_Template.replace("{verificationCode}", verificationCode),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("catch error");
  }
};

const WelcomeEmail = async (email, name) => {
  try {
    const response = await transporter.sendMail({
      from: "bidvault.auction@gmail.com",
      to: email,
      subject: "Welcome to BidVault",
      html: Welcome_Email_Template.replace("{name}", name),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("catch error");
  }
};

const SendOutBidEmail = async (email, itemName, currentBid, maxLimit, auctionId, title) => {
  try {
    const htmlContent = Outbid_Email_Template
      .replace("{itemName}", itemName)
      .replace("{auctionTitle}", title)
      .replace("{currentBid}", currentBid)
      .replace("{maxLimit}", maxLimit)
      .replaceAll("{auctionId}", auctionId);

    const response = await transporter.sendMail({
      from: "bidvault.auction@gmail.com",
      to: email,
      subject: `You've Been Outbid on ${itemName} in ${title} - BidVault`,
      html: htmlContent,
    });

    console.log("Outbid email sent successfully", response);
  } catch (error) {
    console.log("Error sending outbid email", error);
  }
};

export { SendVerificationCode, WelcomeEmail, SendOutBidEmail };