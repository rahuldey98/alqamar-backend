# Class V2 — Edit & Delete API Contract

This document provides the frontend integration contract for the **Update (`PATCH`)** and **Delete (`DELETE`)** endpoints of the **Daily Ad-hoc Classes (`class_v2`)** module.

---

## Global Conventions

- **Base URL:** `/classes-v2`
- **Authentication:** Bearer JWT required in the `Authorization` header for all requests:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Timezone Standard:** All dates and times are evaluated in **Indian Standard Time (IST / UTC+05:30)**.
  - **Date Format:** `"YYYY-MM-DD"` (e.g., `"2026-08-28"`)
  - **Time Format:** `"HH:MM"` in 24-hour format (e.g., `"14:30"`, `"17:00"`)
- **Standard Response Envelope:**
  ```json
  {
    "status": "success",
    "message": null,
    "data": { ... }
  }
  ```

---

## 1. Edit / Update Class

Updates an existing class session. Supports partial updates for time, Google Meet link, student, and teacher.

- **Method:** `PATCH`
- **URL:** `/classes-v2/:id`
- **Allowed Roles:** `TEACHER`, `ADMIN`
- **Path Parameters:**
  - `id` *(number, required)*: ID of the class to update (e.g., `/classes-v2/1`)

### Role Permissions & Business Rules
1. **Teacher:**
   - Can only edit their **own** scheduled classes (`teacherId` matches authenticated user).
   - Cannot reassign the class to another teacher.
   - **Attendance Lock:** Cannot change `studentId` if attendance has already been recorded (`attendanceStatus !== PENDING` or either party has joined).
2. **Admin:**
   - Can edit any class, including reassigning `teacherId` or `studentId`.
3. **Time Validation & Conflicts:**
   - `endTime` must be strictly after `startTime`.
   - If scheduled for today in IST, `endTime` cannot be a time that has already passed.
   - The server validates that neither the teacher nor the student has another active class overlapping with the new time slot today.

### Request Body (Partial Update — all fields optional)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `startTime` | `string` | No | 24-hr format `"HH:MM"` (e.g., `"16:30"`) |
| `endTime` | `string` | No | 24-hr format `"HH:MM"` (must be $> \text{startTime}$) |
| `meetLink` | `string \| null` | No | Google Meet / Zoom URL |
| `studentId` | `number` | No | ID of the student (cannot be changed if attendance was already marked) |
| `teacherId` | `number` | No | ID of the teacher (**Admin only**) |
| `date` | `string` | No | `"YYYY-MM-DD"` format |

### Sample Request
```http
PATCH /classes-v2/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "startTime": "16:30",
  "endTime": "17:30",
  "meetLink": "https://meet.google.com/xyz-uvw-rst"
}
```

### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "teacherId": 3,
    "studentId": 14,
    "date": "2026-08-28",
    "startTime": "16:30",
    "endTime": "17:30",
    "meetLink": "https://meet.google.com/xyz-uvw-rst",
    "status": "ACTIVE",
    "teacherAttended": false,
    "studentAttended": false,
    "teacherJoinedAt": null,
    "studentJoinedAt": null,
    "attendanceStatus": "PENDING",
    "createdAt": "2026-08-28T05:30:00.000Z",
    "updatedAt": "2026-08-28T06:15:00.000Z",
    "teacher": {
      "user": {
        "id": 3,
        "name": "Ustadh Ahmad",
        "phone": "9876543210",
        "role": "TEACHER",
        "meetLink": "https://meet.google.com/xyz-uvw-rst"
      }
    },
    "student": {
      "user": {
        "id": 14,
        "name": "Zaid Ali",
        "phone": "9123456780",
        "role": "STUDENT"
      },
      "course": {
        "id": 2,
        "title": "Tajweed Basics",
        "enTitle": "Tajweed Basics"
      }
    }
  }
}
```

### Common Error Responses
- **`400 Bad Request`**:
  ```json
  { "status": "error", "message": "endTime must be strictly after startTime" }
  ```
  ```json
  { "status": "error", "message": "Cannot set class endTime to a time that has already passed today in IST" }
  ```
  ```json
  { "status": "error", "message": "Cannot change student after attendance has been recorded" }
  ```
- **`403 Forbidden`**:
  ```json
  { "status": "error", "message": "Forbidden: You are not the teacher for this class" }
  ```
  ```json
  { "status": "error", "message": "Forbidden: Teachers cannot reassign classes to other teachers" }
  ```
- **`404 Not Found`**:
  ```json
  { "status": "error", "message": "Class not found or inactive" }
  ```
- **`409 Conflict`**:
  ```json
  { "status": "error", "message": "A class is already scheduled during this time slot today for the teacher or student" }
  ```

---

## 2. Delete / Cancel Class

Soft-deletes a class by setting its status to `INACTIVE`.

- **Method:** `DELETE`
- **URL:** `/classes-v2/:id`
- **Allowed Roles:** `TEACHER`, `ADMIN`
- **Path Parameters:**
  - `id` *(number, required)*: ID of the class to delete (e.g., `/classes-v2/1`)

### Role Permissions & Business Rules
1. **Teacher:**
   - Can only delete their **own** scheduled classes.
   - **Attendance Lock:** Cannot delete a class once attendance has already been recorded (`attendanceStatus !== PENDING` or either teacher/student marked present).
2. **Admin:**
   - Can delete any class.
3. **Slot Freeing Behavior:**
   - As soon as a class is deleted, its time slot is immediately released.
   - The teacher can immediately schedule a new class with the same student at the exact same time slot without running into an overlap conflict.

### Sample Request
```http
DELETE /classes-v2/1
Authorization: Bearer <token>
```

### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "teacherId": 3,
    "studentId": 14,
    "date": "2026-08-28",
    "startTime": "16:30",
    "endTime": "17:30",
    "meetLink": "https://meet.google.com/xyz-uvw-rst",
    "status": "INACTIVE",
    "teacherAttended": false,
    "studentAttended": false,
    "attendanceStatus": "PENDING",
    "teacher": {
      "user": {
        "id": 3,
        "name": "Ustadh Ahmad",
        "phone": "9876543210",
        "role": "TEACHER"
      }
    },
    "student": {
      "user": {
        "id": 14,
        "name": "Zaid Ali",
        "phone": "9123456780",
        "role": "STUDENT"
      },
      "course": {
        "id": 2,
        "title": "Tajweed Basics",
        "enTitle": "Tajweed Basics"
      }
    }
  }
}
```

### Common Error Responses
- **`400 Bad Request`**:
  ```json
  { "status": "error", "message": "Cannot delete class after attendance has been recorded" }
  ```
- **`403 Forbidden`**:
  ```json
  { "status": "error", "message": "Forbidden: You are not the teacher for this class" }
  ```
- **`404 Not Found`**:
  ```json
  { "status": "error", "message": "Class not found or already inactive" }
  ```

---

## 3. TypeScript Client Interfaces

```typescript
export interface UpdateClassV2Payload {
  startTime?: string;      // "HH:MM" 24-hr format
  endTime?: string;        // "HH:MM" 24-hr format
  meetLink?: string | null;
  studentId?: number;
  teacherId?: number;      // Admin only
  date?: string;           // "YYYY-MM-DD"
}

export interface ClassV2Item {
  id: number;
  teacherId: number;
  studentId: number;
  date: string;
  startTime: string;
  endTime: string;
  meetLink?: string | null;
  status: "ACTIVE" | "INACTIVE";
  teacherAttended: boolean;
  studentAttended: boolean;
  teacherJoinedAt: string | null;
  studentJoinedAt: string | null;
  attendanceStatus: "PENDING" | "TEACHER_PRESENT" | "STUDENT_PRESENT" | "ALL_PRESENT" | "ABSENT";
  createdAt: string;
  updatedAt: string;
  teacher: {
    user: {
      id: number;
      name: string;
      phone: string;
      role: "TEACHER" | "ADMIN" | "STUDENT";
      meetLink?: string | null;
    };
  };
  student: {
    user: {
      id: number;
      name: string;
      phone: string;
      role: "TEACHER" | "ADMIN" | "STUDENT";
    };
    course?: {
      id: number;
      title: string;
      enTitle: string;
    } | null;
  };
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data: T;
}
```
