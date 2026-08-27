# Daily Ad-Hoc Classes (`class_v2`) — Frontend API Contract

This document specifies the REST API endpoints, TypeScript interfaces, validation constraints, and sample payloads for integrating the **Daily Ad-hoc Classes (`class_v2`)** feature.

---

## 1. Global Conventions

- **Base URL Route:** `/classes-v2`
- **Authentication:** Bearer JWT required in all requests:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Timezone Standard:** All dates and times are evaluated in **Indian Standard Time (IST / UTC+05:30)**.
  - **Date Format:** `"YYYY-MM-DD"` (e.g., `"2026-08-26"`)
  - **Time Format:** `"HH:MM"` in 24-hour format (e.g., `"09:30"`, `"14:00"`, `"21:45"`)
- **Standard Response Envelope:**
  ```json
  {
    "status": "success",
    "message": null,
    "data": { ... }
  }
  ```

---

## 2. TypeScript Types & Enums

```typescript
export enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT"
}

export enum ClassAttendanceStatus {
  PENDING = "PENDING",                 // Neither has marked attendance yet
  TEACHER_PRESENT = "TEACHER_PRESENT", // Only teacher marked attendance
  STUDENT_PRESENT = "STUDENT_PRESENT", // Only student marked attendance
  ALL_PRESENT = "ALL_PRESENT",         // Both teacher & student are present
  ABSENT = "ABSENT"                   // Marked absent
}

export interface UserPublicProfile {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  gender?: "MALE" | "FEMALE" | null;
  meetLink?: string | null;
}

export interface ClassV2Item {
  id: number;
  date: string;                       // "YYYY-MM-DD"
  startTime: string;                  // "HH:MM" (e.g. "14:30")
  endTime: string;                    // "HH:MM" (e.g. "15:30")
  isOngoing?: boolean;                // True if currentTime is between startTime and endTime
  meetLink?: string | null;
  teacher: {
    id: number;
    name: string;
    phone?: string;
  };
  student: {
    id: number;
    name: string;
    phone?: string;
    course?: string | null;
  };
  attendance: {
    status: ClassAttendanceStatus;
    teacherAttended: boolean;
    studentAttended: boolean;
    teacherJoinedAt: string | null;   // ISO Date timestamp
    studentJoinedAt: string | null;   // ISO Date timestamp
  };
}
```

---

## 3. API Endpoints

---

### 1. Create Class
Creates a daily ad-hoc class for **today in IST**.

- **Method:** `POST`
- **URL:** `/classes-v2`
- **Allowed Roles:** `TEACHER`, `ADMIN`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `studentId` | `number` | **Yes** | ID of the student |
| `startTime` | `string` | **Yes** | 24-hr format `"HH:MM"` (e.g., `"15:00"`) |
| `endTime` | `string` | **Yes** | 24-hr format `"HH:MM"` (must be $> \text{startTime}$) |
| `date` | `string` | No | Optional. If provided, must match today's date in IST (`"YYYY-MM-DD"`). Defaults to today in IST. |
| `meetLink` | `string` | No | Optional Google Meet / Zoom URL. Defaults to Teacher's saved `meetLink` if omitted. |
| `teacherId` | `number` | No | Optional. Only used by `ADMIN` to create a class on behalf of a specific teacher. |

#### Sample Request
```http
POST /classes-v2
Content-Type: application/json
Authorization: Bearer <token>

{
  "studentId": 14,
  "startTime": "16:00",
  "endTime": "17:00",
  "meetLink": "https://meet.google.com/abc-defg-hij"
}
```

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "teacherId": 3,
    "studentId": 14,
    "date": "2026-08-26",
    "startTime": "16:00",
    "endTime": "17:00",
    "meetLink": "https://meet.google.com/abc-defg-hij",
    "status": "ACTIVE",
    "teacherAttended": false,
    "studentAttended": false,
    "teacherJoinedAt": null,
    "studentJoinedAt": null,
    "attendanceStatus": "PENDING",
    "createdAt": "2026-08-26T05:30:00.000Z",
    "updatedAt": "2026-08-26T05:30:00.000Z",
    "teacher": {
      "user": {
        "id": 3,
        "name": "Ustadh Ahmad",
        "phone": "9876543210",
        "role": "TEACHER",
        "meetLink": "https://meet.google.com/abc-defg-hij"
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

#### Common Error Codes
- `400 Bad Request`: `endTime` is before `startTime`, class is scheduled in the past, or date is not today.
- `409 Conflict`: Teacher or student already has another active class scheduled during this time slot today.

---

### 2. Get Active & Upcoming Classes (Today)
Fetches all classes scheduled for **today in IST** where the `endTime` has not passed yet.

- **Method:** `GET`
- **URL:** `/classes-v2`
- **Allowed Roles:** `TEACHER`, `STUDENT`, `ADMIN`
- **Behavior by Role:**
  - `TEACHER`: Returns only classes taught by the authenticated teacher.
  - `STUDENT`: Returns only classes assigned to the authenticated student.
  - `ADMIN`: Returns all active/upcoming classes across the entire institute.

#### Sample Request
```http
GET /classes-v2
Authorization: Bearer <token>
```

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "date": "2026-08-26",
      "startTime": "16:00",
      "endTime": "17:00",
      "isOngoing": true,
      "meetLink": "https://meet.google.com/abc-defg-hij",
      "teacher": {
        "id": 3,
        "name": "Ustadh Ahmad"
      },
      "student": {
        "id": 14,
        "name": "Zaid Ali",
        "course": "Tajweed Basics"
      },
      "attendance": {
        "status": "TEACHER_PRESENT",
        "teacherAttended": true,
        "studentAttended": false,
        "teacherJoinedAt": "2026-08-26T10:30:15.000Z",
        "studentJoinedAt": null
      }
    }
  ]
}
```

---

### 3. Mark Attendance
Marks attendance for a class session. Supports both `POST` and `PATCH`.

- **Method:** `POST` or `PATCH`
- **URL:** `/classes-v2/:id/attendance`
- **Allowed Roles:** `TEACHER`, `STUDENT`, `ADMIN`

#### Request Body (Optional)
```json
{
  "status": "PRESENT" // Optional: "PRESENT" or "ABSENT". Defaults to "PRESENT".
}
```
*(You can also send `{}` or an empty body when a user clicks "Join Class" or "Mark Present".)*

#### Behavior
- When **Teacher** calls: sets `teacherAttended: true`, records `teacherJoinedAt`.
- When **Student** calls: sets `studentAttended: true`, records `studentJoinedAt`.
- If both have joined: updates `attendanceStatus` to `"ALL_PRESENT"`.

#### Sample Request
```http
POST /classes-v2/1/attendance
Authorization: Bearer <token>
Content-Type: application/json

{}
```

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "date": "2026-08-26",
    "startTime": "16:00",
    "endTime": "17:00",
    "attendanceStatus": "ALL_PRESENT",
    "teacherAttended": true,
    "studentAttended": true,
    "teacherJoinedAt": "2026-08-26T10:30:15.000Z",
    "studentJoinedAt": "2026-08-26T10:32:00.000Z"
  }
}
```

---

### 4. Get Attendance Records by Date
Fetches full attendance logs filtered by a specific calendar date in IST.

- **Method:** `GET`
- **URL:** `/classes-v2/attendance?date=YYYY-MM-DD`
- **Allowed Roles:** `TEACHER`, `STUDENT`, `ADMIN`
- **Query Parameters:**
  - `date` *(optional)*: `"YYYY-MM-DD"` format (e.g. `?date=2026-08-26`). Defaults to today in IST if omitted.

#### Sample Request
```http
GET /classes-v2/attendance?date=2026-08-26
Authorization: Bearer <token>
```

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "date": "2026-08-26",
    "timezone": "IST",
    "totalClasses": 2,
    "classes": [
      {
        "classId": 1,
        "courseTitle": "Tajweed Basics",
        "startTime": "16:00",
        "endTime": "17:00",
        "attendanceStatus": "ALL_PRESENT",
        "teacher": {
          "id": 3,
          "name": "Ustadh Ahmad",
          "attended": true,
          "joinedAt": "2026-08-26T10:30:15.000Z"
        },
        "student": {
          "id": 14,
          "name": "Zaid Ali",
          "attended": true,
          "joinedAt": "2026-08-26T10:32:00.000Z"
        }
      }
    ]
  }
}
```

---

### 5. Get Class Details by ID
Fetches a single class by its unique ID.

- **Method:** `GET`
- **URL:** `/classes-v2/:id`
- **Allowed Roles:** `TEACHER`, `STUDENT`, `ADMIN`

#### Sample Request
```http
GET /classes-v2/1
Authorization: Bearer <token>
```

---

### 6. Edit Class Details
Updates an existing class session. Supports partial updates for time, meet link, student, and teacher.

- **Method:** `PATCH`
- **URL:** `/classes-v2/:id`
- **Allowed Roles:** `TEACHER`, `ADMIN`
- **Behavior by Role:**
  - `TEACHER`: Can only edit their own scheduled class. Cannot reassign `teacherId`. Cannot change `studentId` if attendance has already been recorded.
  - `ADMIN`: Can edit any class, including reassigning `teacherId` or `studentId`.

#### Request Body (All fields optional for partial update)
| Field | Type | Description |
| :--- | :--- | :--- |
| `startTime` | `string` | 24-hr format `"HH:MM"` (e.g., `"16:30"`) |
| `endTime` | `string` | 24-hr format `"HH:MM"` (must be $> \text{startTime}$) |
| `meetLink` | `string \| null` | Google Meet / Zoom link |
| `studentId` | `number` | ID of new student (cannot be changed if attendance already marked) |
| `teacherId` | `number` | ID of new teacher (**Admin only**) |
| `date` | `string` | `"YYYY-MM-DD"` format |

#### Sample Request
```http
PATCH /classes-v2/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "startTime": "16:30",
  "endTime": "17:30",
  "meetLink": "https://meet.google.com/new-link-xyz"
}
```

#### Success Response (`200 OK`)
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
    "meetLink": "https://meet.google.com/new-link-xyz",
    "status": "ACTIVE",
    "teacherAttended": false,
    "studentAttended": false,
    "attendanceStatus": "PENDING",
    "teacher": { ... },
    "student": { ... }
  }
}
```

#### Common Error Codes
- `400 Bad Request`: `endTime` is before `startTime`, `endTime` has already passed today in IST, or attempting to change `studentId` after attendance has been recorded.
- `403 Forbidden`: Teacher attempting to edit another teacher's class, or non-admin attempting to reassign `teacherId`.
- `404 Not Found`: Class does not exist or is inactive.
- `409 Conflict`: Teacher or student already has an overlapping active class scheduled during this new time slot today.

---

### 7. Delete / Cancel Class
Soft-deletes an active class session by setting its status to `INACTIVE`. This immediately frees up the time slot so a new class can be scheduled for the same student/teacher at the same time.

- **Method:** `DELETE`
- **URL:** `/classes-v2/:id`
- **Allowed Roles:** `TEACHER`, `ADMIN`
- **Behavior & Rules:**
  - `TEACHER`: Can only delete their own scheduled class. Cannot delete a class if attendance has already been recorded (`attendanceStatus !== PENDING`).
  - `ADMIN`: Can delete any class.
  - Deleting a class frees up the time slot immediately for re-booking.

#### Sample Request
```http
DELETE /classes-v2/1
Authorization: Bearer <token>
```

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "status": "INACTIVE",
    "teacherId": 3,
    "studentId": 14,
    "date": "2026-08-28",
    "startTime": "16:30",
    "endTime": "17:30",
    "attendanceStatus": "PENDING"
  }
}
```

#### Common Error Codes
- `400 Bad Request`: Attempting to delete a class after attendance has already been marked.
- `403 Forbidden`: Teacher attempting to delete another teacher's class.
- `404 Not Found`: Class does not exist or is already inactive.

---

### 8. Monthly Attendance Summary Preview
Retrieves an aggregated monthly attendance summary for the institute (Admin) or for a specific teacher.

- **Method:** `GET`
- **URL:** `/classes-v2/attendance/summary?month=YYYY-MM` (with optional `&teacherId=N`)
- **Allowed Roles:** `TEACHER`, `STUDENT`, `ADMIN`
- **Behavior by Role:**
  - `STUDENT`: Automatically restricted to their own classes (`studentId` matches authenticated user).
  - `TEACHER`: Automatically restricted to their own classes (`teacherId` matches authenticated user). Passing a different `teacherId` returns `403 Forbidden`.
  - `ADMIN`: Aggregates institute-wide by default, or filters by `teacherId` when provided.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `month` | `string` | **Yes** | Target month in `"YYYY-MM"` format (IST) | `2026-08` |
| `teacherId` | `number` | No | Optional filter for `ADMIN` role | `3` |

#### Metrics Definition
- `totalClasses`: Total scheduled active class sessions in the selected month up to the current date in IST.
- `allPresent`: Count of sessions where `attendanceStatus = 'ALL_PRESENT'` (both teacher and student attended).
- `teacherPresentOnly`: Count of sessions where only the teacher joined (`TEACHER_PRESENT`).
- `studentPresentOnly`: Count of sessions where only the student entered (`STUDENT_PRESENT`).
- `absent`: Count of sessions flagged as `ABSENT`.
- `pending`: Count of sessions where attendance has not been marked yet (`PENDING`).
- `attendanceRate`: Percentage calculated as `(allPresent / totalClasses) * 100` rounded to 1 decimal place (or `0` if `totalClasses = 0`).

#### Sample Request
```http
GET /classes-v2/attendance/summary?month=2026-08
Authorization: Bearer <token>
```

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "month": "2026-08",
    "timezone": "Asia/Kolkata",
    "summary": {
      "totalClasses": 48,
      "allPresent": 38,
      "teacherPresentOnly": 4,
      "studentPresentOnly": 2,
      "absent": 4,
      "pending": 0,
      "attendanceRate": 79.2
    }
  }
}
```

#### Common Error Codes
- `400 Bad Request`: `month` is missing or not in `"YYYY-MM"` format, or `teacherId` is not numeric.
- `403 Forbidden`: Teacher attempting to query another teacher's attendance summary.
- `404 Not Found`: Specific `teacherId` queried by Admin does not exist.

---

## 4. Frontend UI State Mapping & Quick Tips

### 1. Attendance Badge Colors
| `attendance.status` | UI Label | Recommended Badge Color |
| :--- | :--- | :--- |
| `PENDING` | Not Started / Pending | Gray / Neutral |
| `TEACHER_PRESENT` | Teacher Joined | Blue / Info |
| `STUDENT_PRESENT` | Student Joined | Orange / Warning |
| `ALL_PRESENT` | Completed / In Session | Green / Success |
| `ABSENT` | Absent | Red / Danger |

### 2. "Join Class" Flow
When a student or teacher clicks the **"Join Google Meet"** button on the UI:
1. Open the `meetLink` in a new browser tab.
2. Silently fire `POST /classes-v2/${classId}/attendance` in the background to automatically record their attendance and join timestamp.
