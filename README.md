# HobbyConnect

> A modern MERN-based social networking platform for discovering hobbies, joining communities, sharing experiences, and connecting with people who share the same interests.

## 🚀 Overview

HobbyConnect is a full-stack social platform designed around hobbies and interest-based communities.

Users can discover new hobbies, join communities, share posts, interact with other members, build connections, and communicate through real-time messaging.

The project is built using the MERN ecosystem with a modern React + TypeScript frontend and a Node.js + Express backend.

---

## ✨ Features

### 👤 Authentication & Profiles

- User registration and login
- JWT-based authentication
- Protected routes
- User profiles
- Profile information and location
- Avatar support
- Personalized user experience

### 🎯 Hobby Discovery

- Browse available hobbies
- Search and explore hobbies
- Hobby categories
- Difficulty levels
- Hobby tags
- Create new hobbies
- Join hobby communities
- Community member counts

### 🏘️ Community Feed

- Create community posts
- Share hobby experiences
- Add titles and detailed descriptions
- Add image URLs
- Add tags
- Filter posts by hobby
- Like posts
- Comment on posts
- View community discussions

### 🤝 Connections

- Discover other users
- Send connection requests
- Accept or reject requests
- Manage connections
- Connect with people based on shared interests

### 💬 Messaging

- User-to-user messaging
- Conversation management
- Real-time communication architecture
- Message history

### 🎨 Modern UI

- Responsive design
- Mobile-friendly layout
- Clean white UI
- Modern cards and components
- Interactive modals
- Smooth hover and transition effects
- Lucide icons

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- React Context API

### Backend

- Node.js
- Express.js
- TypeScript
- REST APIs
- JWT Authentication
- bcrypt

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### Development

- Vite
- tsx
- ESLint
- Git
- GitHub

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │     Browser      │
                    │  React + Vite    │
                    └────────┬─────────┘
                             │
                             │ HTTP / REST API
                             ▼
                    ┌──────────────────┐
                    │  Express Server  │
                    │   Node.js + TS    │
                    └────────┬─────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        Authentication   API Routes      Business Logic
             │               │               │
             └───────────────┼───────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     MongoDB      │
                    │    Mongoose      │
                    └──────────────────┘
