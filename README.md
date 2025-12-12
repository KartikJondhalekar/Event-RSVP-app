# Event RSVP Web Application

A responsive, client-side **Event RSVP Web Application** built using **HTML, CSS, and JavaScript**, designed to allow users to browse events, view details, and submit RSVP responses through an intuitive UI.

This project was developed with a strong focus on clean UI structure, DOM manipulation, and maintainable front-end code practices.

---

## 🚀 Features

- 📅 Fetch event data from a relational database
- 📝 Submit and manage RSVP attendee information
- 🔁 Serverless backend with API-driven communication
- ⚡ Scalable, low-latency architecture
- 🌐 Globally distributed front-end delivery

---

## 🛠️ Tech Stack

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **AWS S3** – Static website hosting
- **AWS CloudFront** – Global CDN distribution

### Backend & Cloud
- **AWS Lambda** – Serverless compute for business logic
- **Amazon API Gateway** – REST API layer
- **Amazon RDS** – Event data storage
- **Amazon DynamoDB** – RSVP attendee data storage

---

## ☁️ Architecture Overview

- The frontend is hosted on **Amazon S3** and distributed via **CloudFront**
- Client requests are routed through **API Gateway**
- **AWS Lambda** functions handle request processing
- **Amazon RDS** stores event metadata
- **DynamoDB** stores RSVP attendee information for fast, scalable access

This architecture follows **serverless and microservice principles**, minimizing infrastructure management while enabling scalability.

---

## 📂 Project Structure
```
.
├── index.html           # Main UI
├── style.css            # Styling
├── app.js               # Entry script (loads events)
├── events.js            # Event logic + modal + RSVP
├── utils.js             # API helpers & formatters
├── index.js             # Lambda backend handler
├── server.js            # Local Server
├── package.json
├── package-lock.json
└── .gitignore
```

## 💡 Key Learnings

- Designing serverless REST APIs using AWS
- Integrating relational and NoSQL databases in a single system
- Managing frontend–backend communication via API Gateway
- Deploying globally available static websites with CloudFront
- Applying cloud architecture patterns in real-world scenarios

---

## ▶️ How to Run Locally

1. Clone the repository:
   ```
   [git clone https://github.com/your-username/event-rsvp-app.git](https://github.com/KartikJondhalekar/Event-RSVP-app)
   ```
    
2. Open index.html directly in your browser or execute server.js to run it via your favorite code editor
   (No build tools or server required)

3. Backend functionality requires deployed AWS resources
