# 📸 Photo Caption Contest

**Photo Caption Contest** is a Back-End application built with **Node.js, Express, Sequelize, and PostgreSQL**.  
It allows users to participate in a photo caption competition where they can submit captions and vote for the best ones, with a secure role-based authorization system suitable for production environments.

This project is designed to be **production-ready**, scalable, and aligned with Back-End best practices.

---

## 🚀 Features

- User registration and authentication
- Role-based authorization (User / Admin)
- Create captions for photos
- Vote on captions
- Prevent duplicate voting (one vote per user per caption)
- Secure caption deletion:
  - Caption owner
  - Admin
- Protected routes (Authentication & Authorization)
- Strong database integrity (Foreign Keys + Cascades)
- Clean and RESTful API structure

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Sequelize ORM**
- **jwt** (authentication)
- **bcrypt** for password hashing
- **dotenv** for environment variables

---

## 📂 Project Structure

│
├── controllers/ # Request handling logic
├── routes/ # API routes
├── models/ # Sequelize models
├── migrations/ # Database migrations
├── middlewares/ # Auth & authorization middlewares
├── config/ # Sequelize & Passport configuration
├── seeders/ # Optional seed data
│
├── app.js / server.js # Application entry point
├── package.json
├── .env.example
└── README.md

---

## 🔐 Role-Based Access Control

| Role  | Permissions                                |
| ----- | ------------------------------------------ |
| user  | Create captions, vote, delete own captions |
| admin | Delete any caption, add and delte images ,manage user roles      |

> ⚠️ Users **cannot** change their own roles.  
> Role updates are restricted to Admin users only.

---

## 🗄️ Database Design

### Core Tables

- **Users**
- **Photos**
- **Captions**
- **Votes**

### Key Constraints

- A user can vote **only once per caption**  
  (Composite UNIQUE index on `userId + captionId`)
- Deleting a caption automatically deletes related votes  
  (`ON DELETE CASCADE`)

---
