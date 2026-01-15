# 🏷️ BidVault – Online Auction System

## Overview

**BidVault** is a full-scale online auction system built to model real-world auction workflows and platform-level responsibilities in a production-style application.  
The system focuses on correctness, transparency, and structured role-based workflows, covering the complete auction lifecycle from listing creation to payment and delivery.

The platform supports real-time and automated bidding, controlled instant purchases, administrative moderation, and delivery tracking within a single, unified system.

---

## 👥 User Roles

### Buyer
- Browse auction listings
- Purchase items instantly using **Buy It Now (before auction bidding starts)**
- Place manual bids once the auction is active
- Use **AutoBid** with configurable bid limits
- Track bid history and watchlisted auctions

### Seller
- Create and manage auction listings
- Set optional **Buy It Now price** before auction activation
- Upload and manage product images
- Monitor live bidding activity
- Track auction outcomes and payments

### Admin
- Platform-wide oversight and moderation
- User and auction management
- Payment verification
- System configuration and monitoring

---

## 🔨 Auction System

- Auction creation with detailed listings and images  
- Optional **Buy It Now price** available **only before auction registration begins**  
- **Real-time bidding** with live updates once the auction is active  
- **AutoBid system** that places bids automatically up to a user-defined limit  
- **Auction extension feature** to prevent last-second bid sniping  
- Automated winner selection and notifications  
- Auction status tracking across all lifecycle stages  

---

## 🔄 Auction Lifecycle

1. **Created** – Seller creates an auction and may define a Buy It Now price  
2. **Buy It Now Window** – Item can be purchased instantly before bidding starts  
3. **Registration Window** – Buyers register for the auction by paying a registration fee (5–10% of the starting price)  
4. **Active** – Auction accepts live bids from registered buyers only  
5. **Extended** – Auction duration auto-extends if bids occur near closing time  
6. **Ended** – Auction closes and winner is determined  
7. **Payment** – Winner completes payment  
8. **Delivery** – Shipment and delivery tracking  

---

## 💳 Payments & Financial Handling

- User registration fee handling  
- Secure UPI-based payments via QR codes and payment links  
- Automatic invoice generation  
- Complete transaction history and financial records  

---

## 🚚 Delivery & Logistics

- Structured delivery workflow management  
- Shipment tracking and delivery status updates  
- Clear separation of delivery logic for maintainability  

---

## ⚙️ Automation & System Features

- Automated auction status updates using scheduled jobs  
- Automated winner announcement and notifications  
- Email notifications for key auction and payment events  
- QR code generation for verification and payments  
- Secure handling of cross-origin requests  

---

## 🚧 Planned Enhancements

- **Rating & review enhancements**, including fraud detection, moderation controls, and improved credibility scoring  
- **Admin face verification** for enhanced platform security  
- **Redis integration** for caching, session handling, and performance optimization  

---

## 🛠️ Current Status

🚧 The project is actively in development, expanding with new academic-focused and student-centric features.

---

**“Code. Create. Empower.”**
