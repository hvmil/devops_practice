# DevOps Full-Stack Project

This project is a **full-stack web application** built with **React**, **Express**, and **PostgreSQL**, designed to help me learn **DevOps concepts**, including **containerization**, **CI/CD**, and **cloud deployment with AWS**. The goal is to create an automated workflow from development to deployment.

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Setup & Installation](#setup--installation)  
- [Dockerization](#dockerization)  
- [CI/CD Pipeline](#cicd-pipeline)  
- [Future Enhancements](#future-enhancements)  
- [License](#license)  

---

## Project Overview

This project demonstrates the following DevOps practices:

- Containerizing a **React frontend**, **Express backend**, and **PostgreSQL database** using Docker.  
- Automating builds, tests, and deployments using **CI/CD** (GitHub Actions / GitLab CI).  
- Deploying the application to a cloud environment with automated updates on code changes.  
- Implementing best practices for environment configuration, secrets management, and development workflow.  

---

## Features

- Full CRUD operations on the backend (Express + PostgreSQL).  
- Interactive frontend built with React.  
- Containerized architecture for development and production.  
- Environment variable management and secure configuration.  
- Automated CI/CD pipeline to build, test, and deploy changes.  

---

## Tech Stack

| Layer       | Technology         |
|------------|------------------|
| Frontend   | React, Axios      |
| Backend    | Express.js, Node.js, PostgreSQL |
| Database   | PostgreSQL        |
| Container  | Docker, Docker Compose |
| CI/CD      | GitHub Actions / GitLab CI |
| Deployment | AWS / Cloud provider (planned) |

---

## Setup & Installation

1. **Clone the repository**:

```bash
git clone https://github.com/hvmil/devops_practice.git
cd devops-fullstack
```

2. **Copy environment files**:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Install dependencies**:

```bash
# Backend
cd backend
npm install

# Frontend
```bash
cd ../frontend
npm install
```
4. **Run Locally without Docker**:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm start
```
## Dockerization
The project uses Docker Compose to run all services together:

```bash
docker-compose up --build
```