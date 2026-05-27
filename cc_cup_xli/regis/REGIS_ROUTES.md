# Registration Routes & Layout Documentation

This document describes the routing structure, page layouts, and API endpoints for the CCCUP XL Registration system.

## 1. Global Layout (`base.html`)
The application uses a common base layout for all registration pages.
- **Navbar**: Contains links to "Home", "Dashboard", "Peraturan", "Panduan", "Perlombaan", and "Login/Logout".
- **Design Tokens**: Uses a custom CSS variable system for colors (Cream, Navy, Gold, etc.) and a typography scale.
- **Mobile Support**: Includes a hamburger menu for mobile responsiveness.
- **Flash Messages**: Centrally handles notifications (success, error, warning, info) using a fixed position overlay.

---

## 2. Main Pages (Routes)

### 🔑 Login Page
- **Route**: `/login`
- **Methods**: `GET`, `POST`
- **Template**: `registration/login.html`
- **Description**: Authenticates the team using their registered email and password.

### 📝 Dashboard
- **Route**: `/dashboard`
- **Methods**: `GET`
- **Template**: `registration/user_dashboard.html`
- **Requirement**: `@regis_login_required`
- **Sections**:
  - **Status Header**: Displays current registration status (Pending, Submitted, Accepted, etc.).
  - **Action Buttons**: Submit/Unsubmit buttons based on status.
  - **Team Info**: Read-only display of basic team details.
  - **Team Metadata Form**: Dynamic inputs for team-level info (e.g., Coach details).
  - **File Uploads**: Section for team-level required PDFs.
  - **Member List**: List of added members with edit/delete options.

### ➕ Add Member
- **Route**: `/add_member`
- **Methods**: `GET`, `POST`
- **Template**: `registration/add_member.html`
- **Description**: Form to add a new team member. Inputs are dynamically generated based on the competition metadata.

### ✏️ Edit Member
- **Route**: `/edit_member/<int:member_id>`
- **Methods**: `GET`, `POST`
- **Template**: `registration/edit_member.html`
- **Description**: Modifies existing member data. Includes file re-upload handling for member-specific documents.

### 🚪 Signup (Closed)
- **Route**: `/<competition>/<jenjang>`
- **Methods**: `GET`, `POST`
- **Template**: `registration/closed.html`
- **Description**: Originally handled user registration, now returns a "Closed" page.

---

## 3. API & Action Endpoints (POST Only)

| Endpoint | Description |
| :--- | :--- |
| `/submit` | Submits the registration. Validates that all required team files and minimum member counts are met. |
| `/unsubmit` | Reverts a "Submitted" or "Reviewed" registration back to "Pending" so the user can edit data. |
| `/upload/<file_type>` | Uploads a team-level file (PDF only). Expects Cloudinary metadata in the request. |
| `/delete_file/<file_type>` | Deletes a team-level file from the database and Cloudinary. |
| `/delete_member/<id>` | Removes a member from the team. |
| `/add_info` | Saves team-level dynamic metadata (like Coach Name, etc.) to the `OtherInfo` table. |
| `/update-rekening` | Updates bank account information for "WO Money" refund (only accessible during `PENDINGTF` status). |
| `/save-subkategori` | Updates the `subkategori` field for a specific member. |
| `/logout` | Clears the user session. |

---

## 4. Route Status Workflow
The system uses `RegisStatus` to control access and UI state:
1. **PENDING**: User can edit anything, add/delete members, and upload files.
2. **SUBMITTED**: Data is locked. User can only view or "Unsubmit".
3. **REVIEWED**: Admin has seen the data but might need changes. User can "Unsubmit" to edit.
4. **PENDINGTF**: Specifically used for payment/rekening info updates.
5. **ACCEPTED**: Final state. No changes allowed.

---

## 5. Regis Staff in the Unified Admin
The registration staff operates primarily within the main Django `/admin/` portal.
- **Group: `Regis_Staff`**: Members of this group can view and edit `Team`, `Member`, and `File` models.
- **Verification Flow**: Staff use the Admin panel to review uploaded PDFs and change a team's status from `SUBMITTED` to `REVIEWED` or `ACCEPTED`.
- **Filtering**: The Admin list view is configured to allow quick filtering by "Competition Name" and "Status" for easy workload management.
