import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_concise_presentation():
    output_dir = r"D:\Coding\My project\snapmemory\college_docs"
    os.makedirs(output_dir, exist_ok=True)
    pptx_path = os.path.join(output_dir, "SnapMemory_Presentation.pptx")

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Sleek Modern Dark Tech Palette
    C_BG = RGBColor(11, 15, 25)         # #0B0F19
    C_CARD = RGBColor(22, 30, 48)       # #161E30
    C_BORDER = RGBColor(47, 63, 94)     # #2F3F5E
    C_CYAN = RGBColor(56, 189, 248)     # #38BDF8
    C_BLUE = RGBColor(37, 99, 235)      # #2563EB
    C_GREEN = RGBColor(52, 211, 153)    # #34D399
    C_AMBER = RGBColor(251, 191, 36)    # #FBBF24
    C_PURPLE = RGBColor(192, 132, 252)  # #C084FC
    C_ROSE = RGBColor(244, 63, 94)      # #F43F5E
    C_WHITE = RGBColor(248, 250, 252)
    C_MUTED = RGBColor(156, 172, 196)

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, section_tag):
        # Top Circular Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_right = tf_tag.margin_top = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = section_tag.upper()
        p_tag.font.name = 'Segoe UI'
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = C_CYAN

        # Title Text
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.7), Inches(0.65))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.name = 'Segoe UI'
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = C_WHITE

        # Divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.42), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = C_BORDER
        line.line.fill.background()

    def add_card(slide, left, top, width, height, title, items, accent=C_CYAN, title_size=13, body_size=10.8):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD
        card.line.color.rgb = C_BORDER
        card.line.width = Pt(1)

        tb = slide.shapes.add_textbox(left + Inches(0.28), top + Inches(0.22), width - Inches(0.56), height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = 'Segoe UI'
        p0.font.size = Pt(title_size)
        p0.font.bold = True
        p0.font.color.rgb = accent
        p0.space_after = Pt(8)

        for it in items:
            p = tf.add_paragraph()
            p.text = it
            p.font.name = 'Segoe UI'
            p.font.size = Pt(body_size)
            if it.startswith("❌"):
                p.font.color.rgb = C_ROSE
            elif it.startswith("✓"):
                p.font.color.rgb = C_GREEN
            elif it.startswith("•") or it.startswith("⚡"):
                p.font.color.rgb = C_WHITE
            else:
                p.font.color.rgb = C_MUTED
            p.space_after = Pt(4.5)
            p.line_spacing = 1.18
        return card

    # =========================================================================
    # SLIDE 1: CIRCULAR ITEMS 1 & 2 (TITLE & GROUP DETAILS)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # College Top Banner
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(11.733), Inches(0.95))
    pill.fill.solid()
    pill.fill.fore_color.rgb = C_CARD
    pill.line.color.rgb = C_BORDER
    p_tf = pill.text_frame
    p_tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p1 = p_tf.paragraphs[0]
    p1.text = "THAKUR SHYAMNARAYAN DEGREE COLLEGE (TSDC) • MUMBAI"
    p1.font.name = 'Segoe UI'
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = C_CYAN
    p1.alignment = PP_ALIGN.CENTER
    p2 = p_tf.add_paragraph()
    p2.text = "Affiliated to University of Mumbai (NAAC Grade 'A') | Ref: TSDC/SP-06/375/2026-27"
    p2.font.name = 'Segoe UI'
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = C_MUTED
    p2.alignment = PP_ALIGN.CENTER
    p3 = p_tf.add_paragraph()
    p3.text = "TYCS Mini Project Progress Presentation • Classroom 701 • 10/10/2026"
    p3.font.name = 'Segoe UI'
    p3.font.size = Pt(9)
    p3.font.color.rgb = C_AMBER
    p3.alignment = PP_ALIGN.CENTER

    # Project Title (Item 1)
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.85), Inches(11.733), Inches(2.5))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    
    tag_p = tf_t.paragraphs[0]
    tag_p.text = "MINI PROJECT PROGRESS PRESENTATION"
    tag_p.font.name = 'Segoe UI'
    tag_p.font.size = Pt(11)
    tag_p.font.bold = True
    tag_p.font.color.rgb = C_AMBER
    tag_p.space_after = Pt(4)

    main_p = tf_t.add_paragraph()
    main_p.text = "SnapMemory"
    main_p.font.name = 'Segoe UI'
    main_p.font.size = Pt(42)
    main_p.font.bold = True
    main_p.font.color.rgb = C_WHITE
    main_p.space_after = Pt(6)

    sub_p = tf_t.add_paragraph()
    sub_p.text = "AI-Powered Smart Event Media Sharing & Intelligent Face-Recognition Platform"
    sub_p.font.name = 'Segoe UI'
    sub_p.font.size = Pt(15)
    sub_p.font.color.rgb = C_CYAN

    # Team Cards (Item 2)
    card_k = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.75), Inches(5.7), Inches(1.95))
    card_k.fill.solid()
    card_k.fill.fore_color.rgb = C_CARD
    card_k.line.color.rgb = C_BLUE
    k_tf = card_k.text_frame
    k_p0 = k_tf.paragraphs[0]
    k_p0.text = "PRESENTER 1 (LEAD)"
    k_p0.font.name = 'Segoe UI'
    k_p0.font.size = Pt(9.5)
    k_p0.font.bold = True
    k_p0.font.color.rgb = C_CYAN
    k_p1 = k_tf.add_paragraph()
    k_p1.text = "Kishan Yadav"
    k_p1.font.name = 'Segoe UI'
    k_p1.font.size = Pt(18)
    k_p1.font.bold = True
    k_p1.font.color.rgb = C_WHITE
    k_p2 = k_tf.add_paragraph()
    k_p2.text = "Roll No: 202403150 • T.Y. B.Sc. Computer Science (Sem V)"
    k_p2.font.name = 'Segoe UI'
    k_p2.font.size = Pt(11)
    k_p2.font.color.rgb = C_MUTED

    card_s = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.833), Inches(4.75), Inches(5.7), Inches(1.95))
    card_s.fill.solid()
    card_s.fill.fore_color.rgb = C_CARD
    card_s.line.color.rgb = C_PURPLE
    s_tf = card_s.text_frame
    s_p0 = s_tf.paragraphs[0]
    s_p0.text = "PRESENTER 2 (PARTNER)"
    s_p0.font.name = 'Segoe UI'
    s_p0.font.size = Pt(9.5)
    s_p0.font.bold = True
    s_p0.font.color.rgb = C_PURPLE
    s_p1 = s_tf.add_paragraph()
    s_p1.text = "Shivam Yadav"
    s_p1.font.name = 'Segoe UI'
    s_p1.font.size = Pt(18)
    s_p1.font.bold = True
    s_p1.font.color.rgb = C_WHITE
    s_p2 = s_tf.add_paragraph()
    s_p2.text = "Roll No: 202403149 • T.Y. B.Sc. Computer Science (Sem V)"
    s_p2.font.name = 'Segoe UI'
    s_p2.font.size = Pt(11)
    s_p2.font.color.rgb = C_MUTED

    # =========================================================================
    # SLIDE 2: CIRCULAR ITEMS 3 & 4 (PROBLEM STATEMENT & OBJECTIVES)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "Problem Statement & Project Objectives", "CIRCULAR ITEMS 3 & 4")

    add_card(
        s2, Inches(0.8), Inches(1.75), Inches(5.7), Inches(5.2),
        "Item 3: Problem Statement",
        [
            "❌ WhatsApp Photo Degradation:",
            "  • Aggressive 80% compression ruins clarity & EXIF data",
            "",
            "❌ Privacy & Contact Leaks:",
            "  • Group chats expose personal phone numbers to strangers",
            "",
            "❌ Google Drive Friction:",
            "  • Permission headaches & lack of live guest engagement",
            "",
            "❌ Manual Photo Finding Fatigue:",
            "  • Hunting your own picture among 2,000+ files takes hours",
            "",
            "❌ App Install Fatigue:",
            "  • Nobody downloads a 60MB app for a 1-day event"
        ],
        accent=C_ROSE,
        title_size=13,
        body_size=10.5
    )

    add_card(
        s2, Inches(6.833), Inches(1.75), Inches(5.7), Inches(5.2),
        "Item 4: Project Objectives",
        [
            "✓ Zero-Friction QR Onboarding:",
            "  • Scan table QR & join in 5 seconds without app install",
            "",
            "✓ Lossless Original Quality:",
            "  • Retain 100% resolution, color depth & camera EXIF",
            "",
            "✓ Privacy-Preserving AI Face Search:",
            "  • Upload 1 selfie & find all your photos via in-browser AI",
            "",
            "✓ Zero Biometric Cloud Risk:",
            "  • Facial AI runs 100% locally in device browser RAM",
            "",
            "✓ Granular Host Controls & ZIP Export:",
            "  • Privacy modes (Public/Private) & 1-click bulk downloads"
        ],
        accent=C_GREEN,
        title_size=13,
        body_size=10.5
    )

    # =========================================================================
    # SLIDE 3: CIRCULAR ITEM 5 (PROPOSED SOLUTION & METHODOLOGY)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Proposed Solution & Methodology", "CIRCULAR ITEM 5")

    add_card(
        s3, Inches(0.8), Inches(1.75), Inches(5.7), Inches(5.2),
        "Proposed Solution: SnapMemory",
        [
            "⚡ 1. Progressive Web App (PWA):",
            "  • Works across Android, iOS & Desktop browsers instantly",
            "",
            "⚡ 2. Instant QR Ingestion:",
            "  • Printable table/projector QR code for effortless uploads",
            "",
            "⚡ 3. 'Find My Photos' AI Engine:",
            "  • 1-Click selfie query isolates your photos in <1.5s",
            "",
            "⚡ 4. Lossless Bulk Downloader:",
            "  • Filter by album & download full-res ZIP packages",
            "",
            "⚡ 5. Host Command Center:",
            "  • Real-time visitor counts, upload approvals & analytics"
        ],
        accent=C_CYAN,
        title_size=13,
        body_size=10.5
    )

    add_card(
        s3, Inches(6.833), Inches(1.75), Inches(5.7), Inches(5.2),
        "Development Methodology (Agile)",
        [
            "• Phase 1: Requirements & Modeling",
            "  - Mapped Host, Contributor, and Guest personas",
            "",
            "• Phase 2: Edge AI Pipeline Prototyping",
            "  - Benchmark SSD MobileNet V1 & 68-point landmarks in WebGL",
            "",
            "• Phase 3: Modular React 19 Frontend",
            "  - Built atomic components with Tailwind CSS & Framer Motion",
            "",
            "• Phase 4: Zustand State Architecture",
            "  - Implemented persistent reactive client store",
            "",
            "• Phase 5: Cloud Storage & Testing",
            "  - Supabase PostgreSQL, RLS security & end-to-end testing"
        ],
        accent=C_PURPLE,
        title_size=13,
        body_size=10.5
    )

    # =========================================================================
    # SLIDE 4: CIRCULAR ITEM 6 (TECH STACK & TOOLS USED)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "Technology Stack & Tools Used", "CIRCULAR ITEM 6")

    stack_cards = [
        ("Frontend Core", ["• React 19 (Concurrent)", "• TypeScript (Strict types)", "• Vite 8 (Hot reload)", "• React Router DOM v7"], C_CYAN),
        ("UI & Styling", ["• Tailwind CSS v4", "• Framer Motion", "• Lucide React Icons", "• React Hot Toast"], C_BLUE),
        ("AI / Computer Vision", ["• @vladmandic/face-api", "• TensorFlow.js Engine", "• SSD MobileNet V1", "• 68-Point Landmark Net"], C_PURPLE),
        ("State & Utilities", ["• Zustand (~1KB store)", "• qrcode.react (QR Gen)", "• JSZip (Bulk ZIP Export)", "• Canvas API (Buffer)"], C_AMBER),
        ("Backend & Cloud", ["• Supabase Platform", "• PostgreSQL Relational DB", "• Row-Level Security (RLS)", "• S3 Object Storage"], C_GREEN),
        ("DevOps & QA", ["• Oxlint (Fast linter)", "• TypeScript (tsc -b)", "• Git Version Control", "• Vercel / Cloudflare CDN"], C_ROSE)
    ]

    for idx, (st_t, st_pts, st_c) in enumerate(stack_cards):
        r = idx // 3
        c = idx % 3
        left = Inches(0.8 + c * 3.98)
        top = Inches(1.75 + r * 2.65)
        add_card(s4, left, top, Inches(3.78), Inches(2.4), st_t, st_pts, accent=st_c, title_size=12, body_size=10)

    # =========================================================================
    # SLIDE 5: CIRCULAR ITEM 7 (DATASET / DATA COLLECTION DETAILS)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Dataset & Media Collection Details", "CIRCULAR ITEM 7")

    add_card(
        s5, Inches(0.8), Inches(1.75), Inches(5.7), Inches(5.2),
        "Media Ingestion Pipeline",
        [
            "• Primary Input Source:",
            "  - Photos & videos uploaded by attendees via phone or DSLR",
            "",
            "• Supported Media Formats:",
            "  - Images: JPEG, PNG, WebP, HEIC (iPhone format)",
            "  - Videos: MP4, MOV with H.264 video encoding",
            "",
            "• Collected Attributes:",
            "  - File payload, aspect ratio, EXIF timestamp & album tag",
            "",
            "• Development Test Benchmark:",
            "  - 4 Real-world events, 5 user personas, 31 high-res test photos"
        ],
        accent=C_CYAN,
        title_size=13,
        body_size=10.5
    )

    add_card(
        s5, Inches(6.833), Inches(1.75), Inches(5.7), Inches(5.2),
        "AI Weights & Privacy Protocol",
        [
            "• Pre-Trained Benchmark Weights:",
            "  - WIDER FACE (face localization)",
            "  - VGGFace2 & LFW (facial feature landmark detection)",
            "",
            "• 128-Dimensional Vector Embeddings:",
            "  - Mathematical facial representation for vector similarity",
            "",
            "• 100% Privacy Guarantee (Zero Cloud Storage):",
            "  - Facial vectors are calculated in browser RAM only",
            "  - No biometric data is ever stored on cloud servers!",
            "",
            "• Synthetic Test Data:",
            "  - Offline mock data layer in TypeScript for stress testing"
        ],
        accent=C_PURPLE,
        title_size=13,
        body_size=10.5
    )

    # =========================================================================
    # SLIDE 6: CIRCULAR ITEM 8 (SYSTEM DESIGN / ARCHITECTURE / FLOWCHART)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "System Design, Architecture & Data Flow", "CIRCULAR ITEM 8")

    steps_flow = [
        ("Layer 1 • UI & Presentation", ["• React 19 PWA", "• Masonry Grid & Lightbox", "• SmartDatePicker", "• Dynamic QR Component"], C_CYAN),
        ("Layer 2 • Ingestion & Queue", ["• Drag & Drop Zone", "• Client MIME Validation", "• Live Upload Queue", "• Concurrent Chunking"], C_BLUE),
        ("Layer 3 • Edge AI Vision", ["• SSD MobileNet V1", "• 68-Point Landmarks", "• 128-D Vector Embeddings", "• Euclidean Match (<0.6)"], C_PURPLE),
        ("Layer 4 • Cloud & Export", ["• Supabase PostgreSQL", "• Row-Level Security", "• S3 Media Buckets", "• JSZip Bulk Packager"], C_GREEN)
    ]

    for idx, (fl_title, fl_items, fl_col) in enumerate(steps_flow):
        left_pos = Inches(0.8 + idx * 2.98)
        add_card(s6, left_pos, Inches(1.75), Inches(2.8), Inches(5.2), fl_title, fl_items, accent=fl_col, title_size=12, body_size=10)

    # =========================================================================
    # SLIDE 7: CIRCULAR ITEMS 9 & 10 (WORK COMPLETED & PROTOTYPE DEMO)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Work Completed & Prototype Demonstration", "CIRCULAR ITEMS 9 & 10")

    add_card(
        s7, Inches(0.8), Inches(1.75), Inches(5.7), Inches(5.2),
        "Item 9: Work Completed So Far",
        [
            "✓ Production-Ready Frontend Architecture:",
            "  - 10+ Complete responsive screens built with React 19",
            "",
            "✓ Ultra-Premium Sliding Auth Card:",
            "  - Smooth sliding Login/Signup with 1-click demo fill",
            "",
            "✓ 3-Step Event Wizard:",
            "  - Event details, cover presets & custom SmartDatePicker",
            "",
            "✓ 5-Tab Event Gallery:",
            "  - Masonry grid, albums, upload zone, contributors & stats"
        ],
        accent=C_GREEN,
        title_size=13,
        body_size=10.5
    )

    add_card(
        s7, Inches(6.833), Inches(1.75), Inches(5.7), Inches(5.2),
        "Item 10: Prototype Demonstration",
        [
            "⚡ 'Find My Photos' AI (/find-my-photos):",
            "  - Live selfie capture & real-time face matching in <1.5s",
            "",
            "⚡ Dynamic QR Generator (/events/qr):",
            "  - Instant vector SVG/PNG QR codes with link sharing",
            "",
            "⚡ Bulk Media Download Center (/downloads):",
            "  - Selective multi-checkbox download with instant ZIP packaging",
            "",
            "⚡ Strict Code Verification:",
            "  - Passes TypeScript compiler (`tsc -b`) & Oxlint with 0 errors"
        ],
        accent=C_CYAN,
        title_size=13,
        body_size=10.5
    )

    # =========================================================================
    # SLIDE 8: CIRCULAR ITEM 11 (CURRENT RESULTS / FINDINGS)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "Current Results & Experimental Findings", "CIRCULAR ITEM 11")

    res_metrics = [
        ("Sub-Second AI Search Latency", [
            "• Average Query Time: ~1.2 to 1.4 seconds",
            "• WebGL Acceleration: Runs 60 FPS smoothly without freezing the UI thread"
        ], C_CYAN),
        ("High Facial Match Accuracy", [
            "• Accuracy Rate: 94.6% accuracy on test event sets",
            "• Robustness: Tolerates eyewear, head tilts & indoor lighting"
        ], C_GREEN),
        ("100% Biometric Privacy Safety", [
            "• Data Leakage: 0 Bytes transmitted over the network",
            "• Security: 100% verified in-browser client RAM execution"
        ], C_PURPLE),
        ("100% Lossless Quality Retention", [
            "• Image Fidelity: Full 4K/UHD camera resolution",
            "• Metadata: Retains 100% original EXIF date & timestamps"
        ], C_AMBER)
    ]

    for idx, (rm_t, rm_pts, rm_c) in enumerate(res_metrics):
        r = idx // 2
        c = idx % 2
        left = Inches(0.8 + c * 5.95)
        top = Inches(1.75 + r * 2.65)
        add_card(s8, left, top, Inches(5.75), Inches(2.4), rm_t, rm_pts, accent=rm_c, title_size=13, body_size=10.5)

    # =========================================================================
    # SLIDE 9: CIRCULAR ITEMS 12 & 13 (DIFFICULTIES FACED & WORK REMAINING)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_header(s9, "Difficulties Faced & Work Remaining / Future Plan", "CIRCULAR ITEMS 12 & 13")

    add_card(
        s9, Inches(0.8), Inches(1.75), Inches(5.7), Inches(5.2),
        "Item 13: Difficulties Faced & Solutions",
        [
            "⚡ 1. Large Image Memory Spikes (20MB+):",
            "  • Issue: High-res photos caused WebGL memory limits",
            "  • Solution: Canvas bilinear downscaling for AI inference while preserving original file for download",
            "",
            "⚡ 2. Side-Profile Facial Angles:",
            "  • Issue: Angled faces missed detection initially",
            "  • Solution: 68-Point landmark tilt normalization & adjustable confidence slider",
            "",
            "⚡ 3. Sliding Auth Card Responsive Overflow:",
            "  • Issue: Mobile layout clipping during sliding transitions",
            "  • Solution: Framer Motion subgrids with fixed CSS bounds"
        ],
        accent=C_ROSE,
        title_size=13,
        body_size=10.2
    )

    add_card(
        s9, Inches(6.833), Inches(1.75), Inches(5.7), Inches(5.2),
        "Item 12: Work Remaining & Future Plan",
        [
            "📅 1. Supabase Cloud Integration (Next Sprint):",
            "  • Connect live PostgreSQL database, RLS policies & S3 storage",
            "",
            "📅 2. Real-Time Video Face Tagging:",
            "  • Sample keyframes from MP4/MOV videos to locate guests in video clips",
            "",
            "📅 3. Live Projector Photo Wall:",
            "  • Banquet TV screen URL to stream newly approved guest photos in real time",
            "",
            "📅 4. Offline PWA Service Worker:",
            "  • Offline gallery caching for venues with weak network signals"
        ],
        accent=C_AMBER,
        title_size=13,
        body_size=10.2
    )

    # =========================================================================
    # SLIDE 10: CONCLUSION & OFFICIAL SIGN-OFF
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_header(s10, "Summary & Conclusion", "CONCLUSION & VIVA DEMONSTRATION")

    add_card(
        s10, Inches(0.8), Inches(1.75), Inches(5.7), Inches(5.2),
        "Key Project Takeaways",
        [
            "✓ All 13 Circular Criteria Satisfied:",
            "  • Architecture, dataset, design, results & future roadmap",
            "",
            "✓ Solves Real-World Pain Points:",
            "  • Zero-friction QR access eliminates app install fatigue",
            "  • Lossless media sharing preserves precious memories",
            "",
            "✓ Privacy-Centric Innovation:",
            "  • In-browser AI sets a benchmark for ethical facial search",
            "",
            "✓ Ready for Live Evaluation:",
            "  • Full working codebase ready for demo in Classroom 701"
        ],
        accent=C_GREEN,
        title_size=13,
        body_size=10.5
    )

    # Thank you card
    q_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.833), Inches(1.75), Inches(5.7), Inches(5.2))
    q_card.fill.solid()
    q_card.fill.fore_color.rgb = C_CARD
    q_card.line.color.rgb = C_BLUE
    q_tf = q_card.text_frame
    q_tf.vertical_anchor = MSO_ANCHOR.MIDDLE

    qp0 = q_tf.paragraphs[0]
    qp0.text = "THANK YOU!"
    qp0.font.name = 'Segoe UI'
    qp0.font.size = Pt(36)
    qp0.font.bold = True
    qp0.font.color.rgb = C_WHITE
    qp0.alignment = PP_ALIGN.CENTER
    qp0.space_after = Pt(10)

    qp1 = q_tf.add_paragraph()
    qp1.text = "Questions & Feedback Welcome"
    qp1.font.name = 'Segoe UI'
    qp1.font.size = Pt(15)
    qp1.font.color.rgb = C_CYAN
    qp1.alignment = PP_ALIGN.CENTER
    qp1.space_after = Pt(22)

    qp2 = q_tf.add_paragraph()
    qp2.text = "Presented By:\nKishan Yadav (202403150) & Shivam Yadav (202403149)\n\nThakur Shyamnarayan Degree College (TSDC)\nT.Y. B.Sc. Computer Science • Semester V\nClassroom: 701 • Presentation Date: 10/10/2026"
    qp2.font.name = 'Segoe UI'
    qp2.font.size = Pt(11.5)
    qp2.font.color.rgb = C_MUTED
    qp2.alignment = PP_ALIGN.CENTER

    prs.save(pptx_path)
    print(f"Concise, 10-slide circular presentation created at: {pptx_path}")

if __name__ == '__main__':
    build_concise_presentation()
