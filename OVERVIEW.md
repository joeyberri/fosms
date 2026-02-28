# Factory Operations & Shift Management System (FOSMS)

---

## 1. PROJECT OVERVIEW

FOSMS is a modern shift management and duty scheduling platform designed for factory operations. It provides:

- **Role-Based Access Control (RBAC)**: Separate login flows for Staff (Role 0) and Admins (Role 1)
- **Real-time Shift Management**: Assign, view, and swap duty shifts
- **Swap Marketplace**: Staff request swaps; admins approve/decline
- **Admin Command Center**: Full user and shift management
- **Reporting Engine**: Filter and export shift schedules by staff or date range

### Business Value
- Reduces manual scheduling workload (drag-and-drop assignments)
- Empowers staff with self-service shift swaps
- Provides admins with privileged oversight and reporting capabilities
- Modern, industrial-grade UI for improved adoption

This is the list of functional requirements provided by client

1.11.1 Functional Requirement:
A Functional Requirement defines the specific behavior, features, or functionalities that a
system must have to fulfill its intended purpose. These requirements focus on what the system
should do, ensuring it meets the needs of users and achieves its objectives. This include:
1. The system shall register new users to the system.
2. The system shall authenticate and authorize all users trying to gain access to the system.
3. The users shall be able to view their duty shift schedule when they login.
4. The system shall register new administrative users.
5. The system shall authenticate the administrative users using employee ID and a
password.
6. Logged in administrative users shall only have access to information based upon the
user's privilege and permission.
7. The system shall assign shift duty to various staffs.
8. The system shall view various staffs.
9. The system shall allow employees to request shift swaps with other staff members.
10. The system shall allow administrative users to approve or decline shift swap requests.
11. The system shall alter/edit a staff's duty.
12. The system shall generate periodic report of the various shift schedule of the various
staffs or for a particular staff.

## 2. FUNCTIONAL REQUIREMENTS MAPPING

| Req # | Functional Requirement | Implementation Phase | Comments |
|-------|------------------------|----------------------|----------|
| 1 | Register new users  
| 2 | Authenticate & authorize users  
| 3 | View duty shift schedule (login) 
| 4 | Register new admin users  
| 5 | Admin authentication (ID + password)  
| 6 | Privilege-based access control  
| 7 | Assign shift duty to staff  
| 8 | View various staff  
| 9 | Request shift swaps (employees)  
| 10 | Approve/decline swaps (admin)  
| 11 | Alter/edit staff duty  
| 12 | Generate periodic reports  

---

## 3. DATABASE SCHEMA (Prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String    @id @default(cuid())
  employeeId      String    @unique
  name            String
  email           String    @unique
  password        String    // Hashed with bcryptjs
  role            Int       @default(0) // 0 = Staff, 1 = Admin
  department      String
  currentShift    String    // e.g., "Morning", "Afternoon", "Night"
  status          String    @default("ACTIVE") // ACTIVE, INACTIVE, LEAVE
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relationships
  shiftAssignments ShiftAssignment[]
  swapRequests    ShiftSwap[] @relation("Requester")
  swapsReceived   ShiftSwap[] @relation("Colleague")
  attendanceRecords Attendance[]
}

model ShiftAssignment {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  shiftType       String    // "Morning", "Afternoon", "Night"
  date            DateTime
  startTime       String    // "06:00"
  endTime         String    // "14:00"
  location        String
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, date]) // One assignment per user per day
}

model ShiftSwap {
  id              String    @id @default(cuid())
  requestDate     DateTime  @default(now())
  userId          String
  user            User      @relation("Requester", fields: [userId], references: [id], onDelete: Cascade)
  colleagueId     String
  colleague       User      @relation("Colleague", fields: [colleagueId], references: [id], onDelete: Cascade)
  requestedDate   DateTime
  currentShift    String    // Staff's current shift on that date
  requestedShift  String    // What they want to swap to
  reason          String?
  status          String    @default("PENDING") // PENDING, APPROVED, REJECTED
  adminNotes      String?
  resolvedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Attendance {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime
  checkInTime     DateTime?
  checkOutTime    DateTime?
  status          String    // "ON_TIME", "LATE", "ABSENT", "PRESENT"
  location        String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, date])
}
```

---
