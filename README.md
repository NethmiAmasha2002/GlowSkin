# 🌸 GlowSkin — Skincare E-Commerce App

A full-stack skincare e-commerce web application built with Angular and Spring Boot, deployed on AWS.

---

## ✨ Features

### Customer Side
- 🛍️ Browse and filter skincare products by category
- 🔍 View detailed product pages
- 🛒 Add products to cart with quantity management
- 💳 Place orders with delivery address
- 🎁 Apply promo/discount codes
- 🔔 Receive order status notifications
- 📬 Contact form to message the team

### Admin Side
- 📦 View and manage all customer orders
- ✅ Accept or reject orders with reason
- 🧴 Add, edit, and delete products
- 🎁 Create and manage promo codes
- ✉️ Read and reply to customer messages
- 👤 Create and manage multiple admin accounts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21 (SSR) |
| Backend | Spring Boot 3.5 (Java 17) |
| Database | MySQL 8.0 |
| Cloud | AWS EC2 + RDS + S3 |
| Styling | SCSS |
| ORM | Spring Data JPA / Hibernate |

---

## ☁️ AWS Architecture
```
User Browser
     │
     ▼
AWS S3 (Static Website Hosting)
  Angular Frontend
     │
     ▼
AWS EC2 (Ubuntu 24.04)
  Spring Boot Backend — Port 8080
     │
     ▼
AWS RDS (MySQL 8.0)
  skincare_db
```

### AWS Services Used
- **S3** — Hosts the Angular production build as a static website
- **EC2** — Runs the Spring Boot JAR file (t3.micro, free tier)
- **RDS** — Managed MySQL database (db.t3.micro, free tier)

---

## 🚀 Deployment

### Backend (EC2)
```bash
# Build JAR locally
./mvnw clean package -DskipTests

# Upload to EC2
scp -i "glowskin-key.pem" target/backend-0.0.1-SNAPSHOT.jar ubuntu@<EC2-IP>:/home/ubuntu/

# SSH into EC2 and run
ssh -i "glowskin-key.pem" ubuntu@<EC2-IP>
nohup java -jar /home/ubuntu/backend-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

### Frontend (S3)
```bash
# Build for production
ng build --configuration production

# Upload contents of dist/skincare-frontend/browser to S3 bucket
```

---

## 🔐 Admin Login
- Email: `admin@glowskin.com`
- Password: `admin123`

---

## 📁 Project Structure
```
GlowSkin/
├── backend/                  # Spring Boot app
│   └── src/main/java/
│       └── com/skincare/backend/
│           ├── controller/   # REST controllers
│           ├── model/        # JPA entities
│           └── repository/   # Spring Data repos
│
└── skincare-frontend/        # Angular app
    └── src/app/
        ├── components/       # UI components
        ├── services/         # Angular services
        └── environments/     # API URL config
```

---

## 👩‍💻 Author
 ❤️ DAN Amasha 
