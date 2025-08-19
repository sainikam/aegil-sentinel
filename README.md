# 🛡️ Aegis Sentinel – AI-Powered Border Security Platform

## 📌 Overview
**Aegis Sentinel** is a **full-stack + AI + real-time border security solution** designed to improve surveillance, safety, and response at sensitive regions like international borders.  
The system integrates **AI-powered detection**, **real-time communication**, and **unit coordination** to help defense forces **identify threats, segregate citizens vs intruders, and respond faster**.

---

## 🚀 Features
- **User Authentication** – Secure login system for soldiers & admins.  
- **Real-time Incident Detection** – AI-powered detection of intruders, weapons, and anomalies.  
- **Incident Management** – Create, update, and track incidents from a central dashboard.  
- **Unit Tracking** – GPS-based monitoring of deployed patrol units.  
- **Instant Alerts** – Real-time push notifications for critical events.  
- **Scalable API** – Backend APIs with MongoDB Atlas for data persistence.  
- **Mock Server Ready** – Postman Mock API for frontend integration before backend is complete.  

---

## 🏗️ Tech Stack

### 🔹 Frontend 
- React.js / Tailwind CSS  
- Map Visualization – **Leaflet.js**  
- Real-time Updates – **Socket.io client**  

### 🔹 Backend 
- Node.js + Express.js  
- MongoDB Atlas (Cloud Database)  
- Mongoose ODM  
- JWT Authentication  
- Socket.io (real-time event handling)  

### 🔹 AI Layer 
- **YOLOv8 + OpenCV** – for intruder & weapon detection from drone/camera feeds.  
- **Multimodal anomaly detection** – panic, fire, or suspicious movement.  

### 🔹 Deployment
- Backend: Railway / Render (MVP) → AWS EC2 (production)  
- Database: MongoDB Atlas (free tier cluster)  
- Frontend: Vercel  

---
