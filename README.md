
# Network KPI Management System

## Project Overview
The **Network KPI Management System** is a web-based platform developed for Sri Lanka Telecom (SLT) to automate the monitoring and calculation of network engineers’ Key Performance Indicators (KPIs).  
Previously, KPI calculations were performed manually using Excel sheets, which increased the risk of human errors and made monitoring difficult.  
This system centralizes KPI data, automates calculations, and provides dashboards for monitoring regional and engineer-level performance.

---

## System Architecture
The system follows a **3‑Tier Architecture**:

1. **Presentation Layer**
   - Angular Frontend
   - Provides dashboards, KPI tables, filtering, and administrative interfaces.

2. **Business Logic Layer**
   - ASP.NET Core Web API
   - Handles authentication, KPI calculations, API endpoints, and business logic.

3. **Data Layer**
   - Microsoft SQL Server
   - Stores KPI definitions, metrics, users, region data, and calculated results.

---

## Technologies Used

### Frontend
- Angular
- TypeScript
- HTML5
- SCSS

### Backend
- ASP.NET Core Web API (.NET)
- Entity Framework Core
- RESTful API architecture

### Database
- Microsoft SQL Server

### Authentication
- Microsoft Azure Active Directory (Azure AD)

### Development Tools
- Visual Studio 2022
- SQL Server Management Studio (SSMS)
- Node.js / npm

---

## Main Features

### Authentication & Authorization
- Azure Active Directory login
- Role-based access control

### KPI Management
- Overall KPI calculation
- Platform-specific KPI monitoring
- Monthly KPI processing and storage

### Dashboard
- Region-wise KPI visualization
- Engineer-level performance drill-down

### Administration
- KPI configuration management
- Region and LEA management
- User administration

### Reporting
- KPI reports
- Export results to Excel

---

## Database

The database is provided as a backup file:

```
NWKPI.bak
```

It contains all tables, KPI configurations, and sample data required to run the system.

---

## Project Files Included

```
KPI_Project_Submission/

├── KPI-azure-login-work.zip   (Full project source code)
├── NWKPI.bak                  (Database backup)
├── KPI Design Document.pdf    (System design documentation)
└── README.md                  (Project setup and overview)
```

---

## System Setup Guide

### 1. Restore Database

1. Open **SQL Server Management Studio (SSMS)**
2. Right-click **Databases**
3. Select **Restore Database**
4. Choose **Device**
5. Select the provided file:

```
NWKPI.bak
```

6. Complete the restore process.

---

### 2. Backend Setup (ASP.NET Core API)

1. Open the backend project in **Visual Studio 2022**
2. Update the database connection string in:

```
appsettings.json
```

Example:

```
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=NWKPI;Trusted_Connection=True;TrustServerCertificate=True"
}
```

3. Run the backend API:

```
dotnet run
```

The API will start locally.

---

### 3. Frontend Setup (Angular)

Navigate to the frontend folder and run:

```
npm install
ng serve
```

The Angular application will run at:

```
http://localhost:4200
```

---

### 4. Login

Login is handled through **Azure Active Directory (SLT tenant)**.

Only authorized SLT users will be able to access the system.

---

## API Structure (Examples)

Example API endpoints used in the system:

```
GET /api/kpi/overall/current
GET /api/kpi/platform/{type}
POST /api/admin/kpi
PUT /api/admin/kpi/{id}
DELETE /api/admin/kpi/{id}
```

---


## Project Team

Prepared for SLT Internship Project

Team Members:
- Nishan Nilanga
- Thashini Gunawardhana
- Kawan Rupasinghe
- Jesuthasan Jathusan
- Dineni Daundasekara


---

## Notes

Ensure the following before running the system:

- SQL Server is running
- Node.js and npm are installed
- .NET SDK is installed
- Azure AD access is configured for authentication
