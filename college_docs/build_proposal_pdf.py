import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Custom canvas to render exact page numbers in format 'Page | X'
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Times-Roman", 10.5)
        # Draw subtle line above footer
        self.setStrokeColor(colors.HexColor("#bbbbbb"))
        self.setLineWidth(0.5)
        self.line(54, 42, 541, 42)
        # Draw page text right aligned
        page_text = f"Page | {self._pageNumber}"
        self.drawRightString(541, 28, page_text)
        self.restoreState()

def generate_pdf():
    pdf_dir = r"D:\Coding\My project\snapmemory\college_docs"
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, "SnapMemory_Project_Proposal.pdf")

    # A4: 595.27 x 841.89 points. Margins: 54 pt (0.75 in / ~1.9 cm)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=46,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Academic Typography Styles (Times-Roman standard for College Submissions)
    style_college_header = ParagraphStyle(
        'CollegeHeader',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=15,
        leading=20,
        alignment=1, # Center
        spaceAfter=3
    )

    style_college_sub = ParagraphStyle(
        'CollegeSub',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=11.5,
        leading=15,
        alignment=1,
        spaceAfter=14
    )

    style_acad_header = ParagraphStyle(
        'AcadHeader',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=14,
        leading=19,
        alignment=1, # Center
        spaceAfter=0
    )

    style_proposal_on = ParagraphStyle(
        'ProposalOn',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=13,
        leading=18,
        alignment=1,
        spaceAfter=14
    )

    style_title_cover = ParagraphStyle(
        'TitleCover',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=16,
        leading=22,
        alignment=1,
        spaceAfter=0
    )

    style_student_info = ParagraphStyle(
        'StudentInfo',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=12,
        leading=18,
        alignment=0 # Left
    )

    style_doc_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        spaceAfter=8
    )

    style_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        spaceBefore=7,
        spaceAfter=3
    )

    style_body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10.2,
        leading=13.8,
        alignment=4, # Justified
        spaceAfter=5
    )

    style_bullet = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10.2,
        leading=13.5,
        leftIndent=15,
        firstLineIndent=-10,
        alignment=4,
        spaceAfter=4
    )

    style_ref = ParagraphStyle(
        'Reference',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=9.8,
        leading=13.2,
        leftIndent=18,
        firstLineIndent=-14,
        alignment=4,
        spaceAfter=5
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("Zagdu Singh Charitable Trust's<br/>THAKUR SHYAMNARAYAN DEGREE COLLEGE (TSDC)", style_college_header))
    story.append(Paragraph("(Affiliated to University of Mumbai)<br/>Kandivali (East), Mumbai – 400101", style_college_sub))
    story.append(Paragraph("T. Y. B. Sc. Computer Science<br/>Semester V<br/><br/>A.Y. 2026 – 2027", style_acad_header))
    
    story.append(Spacer(1, 60))
    story.append(Paragraph("Project Proposal ON", style_proposal_on))
    story.append(Paragraph("SnapMemory: AI-Powered Smart Event Media Sharing &amp; Intelligent Face-Recognition Retrieval Platform", style_title_cover))
    
    story.append(Spacer(1, 80))
    student_text = """
    <u>Submitted By:</u><br/><br/>
    Name: Kishan Yadav<br/>
    Roll No : 202403150<br/><br/>
    Name: Shivam Yadav<br/>
    Roll No : 202403149
    """
    story.append(Paragraph(student_text, style_student_info))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: TITLE, INTRODUCTION, OBJECTIVES, SCOPE (PART 1)
    # =========================================================================
    story.append(Paragraph("<b>Title : SnapMemory: AI-Powered Smart Event Media Sharing &amp; Intelligent Face-Recognition Retrieval Platform</b>", style_doc_title))
    
    story.append(Paragraph("Introduction:", style_heading))
    p1 = ("In the contemporary digital landscape, personal and institutional events such as weddings, academic conferences, "
          "college festivals, and corporate galas produce thousands of high-definition photographs and video recordings. "
          "However, organizing, collecting, and redistributing this massive volume of digital media across hundreds of attendees "
          "remains inefficient and disorganized. Traditional consumer channels relied upon by event guests—predominantly instant "
          "messaging applications such as WhatsApp or manual cloud storage repositories like Google Drive—suffer from acute architectural "
          "shortcomings. Instant messengers enforce severe lossy compression that degrades photographic resolution, strips away EXIF metadata, "
          "and compromises personal privacy by broadcasting private contact numbers within massive public groups. Cloud drives, on the other hand, "
          "present cumbersome permission barriers, require host curation, and lack real-time interactive community streams.")
    story.append(Paragraph(p1, style_body))

    p2 = ("Furthermore, following the conclusion of any large event, individual attendees face the exhausting friction of manually "
          "browsing through thousands of unrelated photos simply to locate pictures of themselves. The convergence of modern Reactive "
          "Web Architectures and Client-Side Edge Artificial Intelligence introduces a powerful paradigm to resolve these inefficiencies. "
          "<b>SnapMemory</b> is an innovative, high-performance event media platform engineered to transform how event memories are captured, "
          "cataloged, and retrieved. By unifying zero-friction dynamic QR-code guest access, lossless media preservation, browser-based "
          "neural network face recognition, and granular multi-tier host governance, SnapMemory establishes a modern, privacy-centric standard "
          "for collaborative event media management.")
    story.append(Paragraph(p2, style_body))

    story.append(Paragraph("Objectives", style_heading))
    obj1 = ("• <b>Zero-Friction Guest Ingestion:</b> Architecting a seamless Progressive Web Application (PWA) that allows attendees to access "
            "event galleries and upload media instantly via localized QR code scans without mandating third-party app installations or complex registrations.")
    obj2 = ("• <b>Privacy-Centric Edge AI Face Matcher:</b> Implementing client-side deep neural network inference (SSD MobileNet V1 and 128-dimensional "
            "biometric embeddings) directly within the user's browser, allowing guests to isolate all their event photos using a single selfie query "
            "with zero server-side biometric data harvesting.")
    obj3 = ("• <b>Lossless High-Fidelity Asset Archiving:</b> Engineering a resilient upload pipeline that preserves the authentic resolution, aspect ratio, "
            "color fidelity, and original EXIF timestamps of uploaded photographs, overcoming the compression defects of conventional messaging apps.")
    obj4 = ("• <b>Comprehensive Host Governance & Access Control:</b> Implementing granular privacy tiers (Public, Password-Protected, Invite-Only) "
            "alongside contributor approval workflows to safeguard private family, social, and academic gatherings.")
    obj5 = ("• <b>Interactive Host Telemetry & Analytics:</b> Providing real-time event analytics dashboards visualizing guest engagement trends, "
            "upload volumes, unique visitor counts, storage metrics, and asset download activities.")
    obj6 = ("• <b>Selective Batch Retrieval & Bulk Archive Packaging:</b> Designing an optimized Download Center supporting album-based filtering, "
            "selective multi-image extraction, and asynchronous ZIP compression for complete full-fidelity event backups.")
    for o in [obj1, obj2, obj3, obj4, obj5, obj6]:
        story.append(Paragraph(o, style_bullet))

    story.append(Paragraph("Scope", style_heading))
    scope_intro = ("This project addresses operational challenges across the lifecycle of event media management, scalable from intimate family "
                   "gatherings to large-scale university fests:")
    story.append(Paragraph(scope_intro, style_body))
    s1 = ("• <b>Dynamic Event Orchestration:</b> Multi-step wizard supporting custom themes, date pickers, venue details, cover photo selectors, "
          "and automated high-resolution vector QR generation for venue display.")
    s2 = ("• <b>Biometric 'Find My Photos' Engine:</b> Client-side facial detection and Euclidean distance feature matching enabling instant personal "
          "photo identification with configurable confidence thresholds.")
    s3 = ("• <b>Dynamic Masonry & Lightbox Gallery:</b> High-performance masonry and square media displays featuring fullscreen Lightbox inspection, "
          "keyboard navigation, touch gestures, and a custom HTML5 video player.")
    for s in [s1, s2, s3]:
        story.append(Paragraph(s, style_bullet))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: SCOPE (CONTD), METHODOLOGY, SYSTEM DESIGN & ARCHITECTURE
    # =========================================================================
    s4 = ("• <b>Multi-Role Security Architecture:</b> Fine-grained role access distinguishing Event Hosts, Approved Contributors, and General Guest Viewers.")
    s5 = ("• <b>High-Throughput Upload Pipeline:</b> Drag-and-drop batch upload zone with real-time progress indicators, file validation, queue management, and concurrent chunking.")
    s6 = ("• <b>Cross-Platform Device Compatibility:</b> Fully responsive UI optimized for Android, iOS mobile devices, tablets, and desktop workstations.")
    for s in [s4, s5, s6]:
        story.append(Paragraph(s, style_bullet))

    story.append(Paragraph("Methodology", style_heading))
    m_intro = ("The engineering lifecycle of SnapMemory follows an Agile, component-driven software methodology, ensuring modularity, type safety, "
               "and iterative validation across development stages:")
    story.append(Paragraph(m_intro, style_body))

    m1 = ("<b>Requirements Engineering & UX Modeling:</b> Mapping core user journeys (Host, Guest, Professional Photographer), formalizing data contracts, "
          "and establishing a modern glassmorphic visual design system using atomic component principles.")
    story.append(Paragraph(m1, style_body))

    m2 = ("<b>Client-Side AI Pipeline Construction:</b> Integrating lightweight convolutional neural network weights (SSD MobileNet V1 for face detection "
          "and a 68-point facial landmark regression model). Feature descriptors are computed over browser WebGL/WebAssembly runtimes, completely bypassing "
          "cloud biometric liabilities.")
    story.append(Paragraph(m2, style_body))

    m3 = ("<b>Modular Frontend Engineering:</b> Assembling atomic UI components using React 19, TypeScript, and Tailwind CSS v4. Implementing smooth "
          "sliding card authentication, modal dialogs, and interactive gestures using Framer Motion.")
    story.append(Paragraph(m3, style_body))

    m4 = ("<b>Reactive State Management & Data Layer:</b> Implementing centralized reactive stores with Zustand, coupled with client persistence and mock "
          "fixtures, engineered for seamless transition to cloud PostgreSQL and storage backends.")
    story.append(Paragraph(m4, style_body))

    story.append(Paragraph("System Design and Development:", style_heading))
    sd1 = ("<b>Frontend Subsystem:</b> Engineered with React 19, Vite, and TypeScript. Implements strict component barrel exports, responsive layout scaffolding, "
           "intelligent date pickers, and hot module reloading for rapid client-side rendering.")
    story.append(Paragraph(sd1, style_body))

    sd2 = ("<b>AI / Computer Vision Subsystem:</b> Employs <code>@vladmandic/face-api</code> with TensorFlow.js core execution. Calculates 128-dimensional "
           "biometric facial vectors and performs vectorized Euclidean distance clustering against event photo libraries in sub-second inference intervals.")
    story.append(Paragraph(sd2, style_body))

    sd3 = ("<b>Backend & Cloud Storage Integration:</b> Designed for Supabase architecture incorporating PostgreSQL relational database storage, Row-Level Security "
           "(RLS) governance, JWT user authentication, and high-capacity S3-compatible media storage buckets.")
    story.append(Paragraph(sd3, style_body))

    sd4 = ("<b>Testing and Quality Assurance:</b> Rigorous static type analysis via TypeScript compiler (<code>tsc -b</code>), code quality auditing using Oxlint, "
           "unit verification of store mutations, and cross-browser stress testing across high-resolution image payloads.")
    story.append(Paragraph(sd4, style_body))

    sd5 = ("<b>Deployment:</b> Continuous deployment on edge platforms (Vercel / Cloudflare) with automated continuous integration, SSL encryption, and global CDN delivery.")
    story.append(Paragraph(sd5, style_body))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: MAINTENANCE, TOOLS & TECH, TIMELINE GANTT CHART, RESOURCES
    # =========================================================================
    story.append(Paragraph("Maintenance and Updates:", style_heading))
    maint = ("Ongoing profiling of client-side AI inference latency, memory garbage collection during large gallery pagination, "
             "browser service worker asset caching, and periodic updates to neural network weight checkpoints for enhanced facial orientation accuracy.")
    story.append(Paragraph(maint, style_body))

    story.append(Paragraph("Tools and Technologies", style_heading))
    tt_lang = "<b>Languages:</b> TypeScript (Strict Type Safety), JavaScript (ESNext), HTML5, CSS3, SQL."
    story.append(Paragraph(tt_lang, style_body))

    tt_libs = """<b>Libraries / Frameworks:</b><br/>
    • <b>Frontend & Build:</b> React 19, Vite 8, React Router DOM, Node.js.<br/>
    • <b>Styling & Animation:</b> Tailwind CSS v4, Framer Motion, Lucide React, React Hot Toast.<br/>
    • <b>Client AI & Vision:</b> <code>@vladmandic/face-api</code> (SSD MobileNet V1, 68-Point Landmarks, Face Recognition Net).<br/>
    • <b>State & Utilities:</b> Zustand, <code>qrcode.react</code> (Vector QR Generator), Canvas API.<br/>
    • <b>Database & Cloud:</b> Supabase (PostgreSQL, Row Level Security, Storage Buckets, Auth).
    """
    story.append(Paragraph(tt_libs, style_body))

    story.append(Paragraph("Timeline", style_heading))
    
    # Gantt Chart Table Construction
    gantt_data = [
        ["TYBSc Computer Science\nProject Gantt Chart", "December", "", "", "January", "", "", "", "February", "", "", "March"],
        ["", "W2", "W3", "W4", "W1", "W2", "W3", "W4", "W1", "W2", "W3", "W1"],
        ["I. Preliminary Study & Proposal", "■", "■", "", "", "", "", "", "", "", "", ""],
        ["II. Requirement Analysis & Wireframes", "", "", "■", "■", "", "", "", "", "", "", ""],
        ["III. System Architecture & Schema", "", "", "", "■", "■", "", "", "", "", "", ""],
        ["IV. AI Face Recognition Pipeline", "", "", "", "", "■", "■", "", "", "", "", ""],
        ["V. UI Component Library & Uploads", "", "", "", "", "", "■", "■", "■", "", "", ""],
        ["VI. Gallery, QR & Download Center", "", "", "", "", "", "", "", "■", "■", "", ""],
        ["VII. Supabase Integration & Testing", "", "", "", "", "", "", "", "", "■", "■", ""],
        ["VIII. Final Deployment & Viva Docs", "", "", "", "", "", "", "", "", "", "", "■"]
    ]

    table_formatted = []
    for r_idx, row in enumerate(gantt_data):
        row_cells = []
        for c_idx, val in enumerate(row):
            if r_idx < 2:
                p = Paragraph(f"<b>{val.replace(chr(10), '<br/>')}</b>", ParagraphStyle('TH', fontName='Times-Bold', fontSize=7.5, leading=9, alignment=1))
            elif c_idx == 0:
                p = Paragraph(val, ParagraphStyle('TDTask', fontName='Times-Roman', fontSize=8, leading=10, alignment=0))
            else:
                p = val
            row_cells.append(p)
        table_formatted.append(row_cells)

    gantt_table = Table(
        table_formatted,
        colWidths=[155, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27],
        rowHeights=[16, 14] + [15] * 8
    )

    t_style = [
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('SPAN', (0,0), (0,1)),
        ('SPAN', (1,0), (3,0)),
        ('SPAN', (4,0), (7,0)),
        ('SPAN', (8,0), (10,0)),
        ('BACKGROUND', (0,0), (-1,1), colors.HexColor("#f0f0f0")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]

    active_coords = [
        (2, 1), (2, 2),
        (3, 3), (3, 4),
        (4, 4), (4, 5),
        (5, 5), (5, 6),
        (6, 6), (6, 7), (6, 8),
        (7, 8), (7, 9),
        (8, 9), (8, 10),
        (9, 11)
    ]
    for r, c in active_coords:
        t_style.append(('BACKGROUND', (c, r), (c, r), colors.HexColor("#2a52be")))
        t_style.append(('TEXTCOLOR', (c, r), (c, r), colors.white))

    gantt_table.setStyle(TableStyle(t_style))
    story.append(gantt_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph("Resources", style_heading))
    story.append(Paragraph("<b>1. Hardware Requirements:</b>", style_body))
    hw1 = "• <b>Processor:</b> Intel Core i3 / AMD Ryzen 3 or higher (i5 recommended for concurrent AI inference)."
    hw2 = "• <b>RAM:</b> 4GB minimum (8GB recommended for browser WebGL neural net tensors)."
    hw3 = "• <b>Storage:</b> 10GB free solid-state storage."
    for h in [hw1, hw2, hw3]:
        story.append(Paragraph(h, style_bullet))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: SYSTEM REQUIREMENTS (CONTD), EXPECTED OUTCOME, REFERENCES
    # =========================================================================
    story.append(Paragraph("<b>2. Software Requirements:</b>", style_body))
    sw1 = "• <b>Operating System:</b> Windows 10/11, macOS, or Linux (cross-platform compatible)."
    sw2 = "• <b>Runtime Environment:</b> Node.js (v18.x or v20.x LTS), npm (v9.x or higher)."
    sw3 = "• <b>Modern Web Browser:</b> Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari with WebGL 2.0 hardware acceleration support."
    sw4 = "• <b>Development Tools:</b> VS Code / Antigravity IDE, Git version control, Oxlint linter."
    for s in [sw1, sw2, sw3, sw4]:
        story.append(Paragraph(s, style_bullet))

    story.append(Paragraph("Expected Outcome", style_heading))
    eo1 = ("• <b>Frictionless Guest Upload Experience:</b> Attendees join live events, view galleries, and submit high-resolution "
           "media in seconds via frictionless QR code scans without mandating external app installations.")
    eo2 = ("• <b>Sub-Second Private AI Face Matching:</b> Individual attendees isolate their personal photos from thousands of event "
           "pictures in under 1.5 seconds directly within the client browser, safeguarding personal biometric privacy by eliminating server-side biometric transfers.")
    eo3 = ("• <b>Preservation of Original Media Fidelity:</b> Complete mitigation of destructive lossy compression and EXIF metadata stripping, "
           "retaining pristine resolution and timestamp data for professional archiving.")
    eo4 = ("• <b>Comprehensive Host Governance & Analytics:</b> Event organizers gain a dedicated control console to curate uploads, moderate media, "
           "manage contributor access requests, inspect engagement telemetry, and configure multi-tier security.")
    eo5 = ("• <b>Production-Grade Scalable Codebase:</b> A strongly typed, modular React 19 architecture adhering to industry-standard patterns "
           "(barrel exports, Zustand state management, and Supabase integration readiness).")
    for eo in [eo1, eo2, eo3, eo4, eo5]:
        story.append(Paragraph(eo, style_bullet))

    story.append(Paragraph("References", style_heading))
    refs = [
        "[1] Dalal, N., &amp; Triggs, B. (2005). 'Histograms of oriented gradients for human detection.' <i>IEEE Computer Society Conference on Computer Vision and Pattern Recognition (CVPR)</i>, Vol. 1, pp. 886-893.",
        "[2] Schroff, F., Kalenichenko, D., &amp; Philbin, J. (2015). 'FaceNet: A unified embedding for face recognition and clustering.' <i>Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)</i>, pp. 815-823.",
        "[3] Howard, A. G., Zhu, M., Chen, B., Kalenichenko, D., Wang, W., Weyand, T., Andreetto, M., &amp; Adam, H. (2017). 'MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications.' <i>arXiv preprint arXiv:1704.04861</i>.",
        "[4] Smilkov, D., Thorat, N., Assogba, Y., Yuan, A., Kreeger, N., Yu, P., Zheng, R., Nielsen, C., Cai, S., Bileschi, S., &amp; Sculley, D. (2019). 'TensorFlow.js: Machine Learning for the Web and Beyond.' <i>Proceedings of Machine Learning and Systems (SysML)</i>, Vol. 1, pp. 415-426.",
        "[5] Fielding, R. T. (2000). 'Architectural Styles and the Design of Network-based Software Architectures.' Doctoral dissertation, University of California, Irvine."
    ]
    for r in refs:
        story.append(Paragraph(r, style_ref))

    # Build document using custom NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {pdf_path}")

if __name__ == '__main__':
    generate_pdf()
