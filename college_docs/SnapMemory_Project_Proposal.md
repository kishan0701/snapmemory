# Zagdu Singh Charitable Trust's
# THAKUR SHYAMNARAYAN DEGREE COLLEGE (TSDC)
### (Affiliated to University of Mumbai)
#### Kandivali (East), Mumbai – 400101

---

### T. Y. B. Sc. Computer Science
### Semester V
### A.Y. 2026 – 2027

---

# Project Proposal ON

## **SnapMemory: AI-Powered Smart Event Media Sharing & Intelligent Face-Recognition Retrieval Platform**

### Submitted By:
**Name:** Kishan Yadav  
**Roll No:** 202403150  

**Name:** Shivam Yadav  
**Roll No:** 202403149  

---
*Page | 1*

\pagebreak

## Title : SnapMemory: AI-Powered Smart Event Media Sharing & Intelligent Face-Recognition Retrieval Platform

### Introduction:
In the contemporary digital landscape, personal and institutional events such as weddings, academic conferences, college festivals, and corporate galas produce thousands of high-definition photographs and video recordings. However, organizing, collecting, and redistributing this massive volume of digital media across hundreds of attendees remains inefficient and disorganized. Traditional consumer channels relied upon by event guests—predominantly instant messaging applications such as WhatsApp or manual cloud storage repositories like Google Drive—suffer from acute architectural shortcomings. Instant messengers enforce severe lossy compression that degrades photographic resolution, strips away EXIF metadata, and compromises personal privacy by broadcasting private contact numbers within massive public groups. Cloud drives, on the other hand, present cumbersome permission barriers, require host curation, and lack real-time interactive community streams.

Furthermore, following the conclusion of any large event, individual attendees face the exhausting friction of manually browsing through thousands of unrelated photos simply to locate pictures of themselves. The convergence of modern Reactive Web Architectures and Client-Side Edge Artificial Intelligence introduces a powerful paradigm to resolve these inefficiencies. **SnapMemory** is an innovative, high-performance event media platform engineered to transform how event memories are captured, cataloged, and retrieved. By unifying zero-friction dynamic QR-code guest access, lossless media preservation, browser-based neural network face recognition, and granular multi-tier host governance, SnapMemory establishes a modern, privacy-centric standard for collaborative event media management.

### Objectives
- **Zero-Friction Guest Ingestion:** Architecting a seamless Progressive Web Application (PWA) that allows attendees to access event galleries and upload media instantly via localized QR code scans without mandating third-party app installations or complex registrations.
- **Privacy-Centric Edge AI Face Matcher:** Implementing client-side deep neural network inference (SSD MobileNet V1 and 128-dimensional biometric embeddings) directly within the user's browser, allowing guests to isolate all their event photos using a single selfie query with zero server-side biometric data harvesting.
- **Lossless High-Fidelity Asset Archiving:** Engineering a resilient upload pipeline that preserves the authentic resolution, aspect ratio, color fidelity, and original EXIF timestamps of uploaded photographs, overcoming the compression defects of conventional messaging apps.
- **Comprehensive Host Governance & Access Control:** Implementing granular privacy tiers (Public, Password-Protected, Invite-Only) alongside contributor approval workflows to safeguard private family, social, and academic gatherings.
- **Interactive Host Telemetry & Analytics:** Providing real-time event analytics dashboards visualizing guest engagement trends, upload volumes, unique visitor counts, storage metrics, and asset download activities.
- **Selective Batch Retrieval & Bulk Archive Packaging:** Designing an optimized Download Center supporting album-based filtering, selective multi-image extraction, and asynchronous ZIP compression for complete full-fidelity event backups.

### Scope
This project addresses operational challenges across the lifecycle of event media management, scalable from intimate family gatherings to large-scale university fests:
- **Dynamic Event Orchestration:** Multi-step wizard supporting custom themes, date pickers, venue details, cover photo selectors, and automated high-resolution vector QR generation for venue display.
- **Biometric 'Find My Photos' Engine:** Client-side facial detection and Euclidean distance feature matching enabling instant personal photo identification with configurable confidence thresholds.
- **Dynamic Masonry & Lightbox Gallery:** High-performance masonry and square media displays featuring fullscreen Lightbox inspection, keyboard navigation, touch gestures, and a custom HTML5 video player.

---
*Page | 2*

\pagebreak

### Scope (Continued)
- **Multi-Role Security Architecture:** Fine-grained role access distinguishing Event Hosts, Approved Contributors, and General Guest Viewers.
- **High-Throughput Upload Pipeline:** Drag-and-drop batch upload zone with real-time progress indicators, file validation, queue management, and concurrent chunking.
- **Cross-Platform Device Compatibility:** Fully responsive UI optimized for Android, iOS mobile devices, tablets, and desktop workstations.

### Methodology
The engineering lifecycle of SnapMemory follows an Agile, component-driven software methodology, ensuring modularity, type safety, and iterative validation across development stages:

- **Requirements Engineering & UX Modeling:** Mapping core user journeys (Host, Guest, Professional Photographer), formalizing data contracts, and establishing a modern glassmorphic visual design system using atomic component principles.
- **Client-Side AI Pipeline Construction:** Integrating lightweight convolutional neural network weights (SSD MobileNet V1 for face detection and a 68-point facial landmark regression model). Feature descriptors are computed over browser WebGL/WebAssembly runtimes, completely bypassing cloud biometric liabilities.
- **Modular Frontend Engineering:** Assembling atomic UI components using React 19, TypeScript, and Tailwind CSS v4. Implementing smooth sliding card authentication, modal dialogs, and interactive gestures using Framer Motion.
- **Reactive State Management & Data Layer:** Implementing centralized reactive stores with Zustand, coupled with client persistence and mock fixtures, engineered for seamless transition to cloud PostgreSQL and storage backends.

### System Design and Development:
- **Frontend Subsystem:** Engineered with React 19, Vite, and TypeScript. Implements strict component barrel exports, responsive layout scaffolding, intelligent date pickers, and hot module reloading for rapid client-side rendering.
- **AI / Computer Vision Subsystem:** Employs `@vladmandic/face-api` with TensorFlow.js core execution. Calculates 128-dimensional biometric facial vectors and performs vectorized Euclidean distance clustering against event photo libraries in sub-second inference intervals.
- **Backend & Cloud Storage Integration:** Designed for Supabase architecture incorporating PostgreSQL relational database storage, Row-Level Security (RLS) policies, JWT user authentication, and high-capacity S3-compatible media storage buckets.
- **Testing and Quality Assurance:** Rigorous static type analysis via TypeScript compiler (`tsc -b`), code quality auditing using Oxlint, unit verification of store mutations, and cross-browser stress testing across high-resolution image payloads.
- **Deployment:** Continuous deployment on edge platforms (Vercel / Cloudflare) with automated continuous integration, SSL encryption, and global CDN delivery.

---
*Page | 3*

\pagebreak

### Maintenance and Updates:
Ongoing profiling of client-side AI inference latency, memory garbage collection during large gallery pagination, browser service worker asset caching, and periodic updates to neural network weight checkpoints for enhanced facial orientation accuracy.

### Tools and Technologies
- **Core Languages:** TypeScript (Strict Type Safety), JavaScript (ESNext), HTML5, CSS3, SQL.
- **Libraries / Frameworks:**
  - **Frontend & Build:** React 19, Vite 8, React Router DOM, Node.js.
  - **Styling & Animation:** Tailwind CSS v4, Framer Motion, Lucide React, React Hot Toast.
  - **Client AI & Vision:** `@vladmandic/face-api` (SSD MobileNet V1, 68-Point Landmarks, Face Recognition Net).
  - **State & Utilities:** Zustand, `qrcode.react` (Vector QR Generator), Canvas API.
  - **Database & Cloud:** Supabase (PostgreSQL, Row Level Security, Storage Buckets, Auth).

### Timeline (Gantt Chart)

| TYBSc Computer Science Project Gantt Chart | December | | | January | | | | February | | | March |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| | **W2** | **W3** | **W4** | **W1** | **W2** | **W3** | **W4** | **W1** | **W2** | **W3** | **W1** |
| **I. Preliminary Study & Proposal** | █ | █ | | | | | | | | | |
| **II. Requirement Analysis & Wireframes** | | | █ | █ | | | | | | | |
| **III. System Architecture & Schema** | | | | █ | █ | | | | | | |
| **IV. AI Face Recognition Pipeline** | | | | | █ | █ | | | | | |
| **V. UI Component Library & Uploads** | | | | | | █ | █ | █ | | | |
| **VI. Gallery, QR & Download Center** | | | | | | | | █ | █ | | |
| **VII. Supabase Integration & Testing** | | | | | | | | | █ | █ | |
| **VIII. Final Deployment & Viva Docs** | | | | | | | | | | | █ |

### Resources
#### 1. Hardware Requirements:
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher (i5 recommended for concurrent AI inference).
- **RAM:** 4GB minimum (8GB recommended for browser WebGL neural net tensors).
- **Storage:** 10GB free solid-state storage.

---
*Page | 4*

\pagebreak

#### 2. Software Requirements:
- **Operating System:** Windows 10/11, macOS, or Linux (cross-platform compatible).
- **Runtime Environment:** Node.js (v18.x or v20.x LTS), npm (v9.x or higher).
- **Modern Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari with WebGL 2.0 hardware acceleration support.
- **Development Tools:** VS Code / Antigravity IDE, Git version control, Oxlint linter.

### Expected Outcome
- **Frictionless Guest Upload Experience:** Attendees join live events, view galleries, and submit high-resolution media in seconds via frictionless QR code scans without mandating external app installations.
- **Sub-Second Private AI Face Matching:** Individual attendees isolate their personal photos from thousands of event pictures in under 1.5 seconds directly within the client browser, safeguarding personal biometric privacy by eliminating server-side biometric transfers.
- **Preservation of Original Media Fidelity:** Complete mitigation of destructive lossy compression and EXIF metadata stripping, retaining pristine resolution and timestamp data for professional archiving.
- **Comprehensive Host Governance & Analytics:** Event organizers gain a dedicated control console to curate uploads, moderate media, manage contributor access requests, inspect engagement telemetry, and configure multi-tier security.
- **Production-Grade Scalable Codebase:** A strongly typed, modular React 19 architecture adhering to industry-standard patterns (barrel exports, Zustand state management, and Supabase integration readiness).

### References
1. Dalal, N., & Triggs, B. (2005). "Histograms of oriented gradients for human detection." *IEEE Computer Society Conference on Computer Vision and Pattern Recognition (CVPR)*, Vol. 1, pp. 886-893.
2. Schroff, F., Kalenichenko, D., & Philbin, J. (2015). "FaceNet: A unified embedding for face recognition and clustering." *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, pp. 815-823.
3. Howard, A. G., Zhu, M., Chen, B., Kalenichenko, D., Wang, W., Weyand, T., Andreetto, M., & Adam, H. (2017). "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications." *arXiv preprint arXiv:1704.04861*.
4. Smilkov, D., Thorat, N., Assogba, Y., Yuan, A., Kreeger, N., Yu, P., Zheng, R., Nielsen, C., Cai, S., Bileschi, S., & Sculley, D. (2019). "TensorFlow.js: Machine Learning for the Web and Beyond." *Proceedings of Machine Learning and Systems (SysML)*, Vol. 1, pp. 415-426.
5. Fielding, R. T. (2000). "Architectural Styles and the Design of Network-based Software Architectures." Doctoral dissertation, University of California, Irvine.

---
*Page | 5*
