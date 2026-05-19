import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import fs from "fs";
import path from "path";

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "Sarah Jenkins",
                            bold: true,
                            size: 32,
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "Austin, TX | sarah.jenkins@example.com | 512-555-0123",
                            size: 20,
                        }),
                    ],
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Professional Summary",
                    heading: HeadingLevel.HEADING_2,
                    border: { bottom: { color: "auto", space: 1, style: "single" as any, size: 6 } },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Strategic Product Marketing Manager with 8+ years of experience in the SaaS industry. Proven track record of leading cross-functional teams to launch high-impact products at HubSpot and Canva. Expert in GTM strategy, user research, and data-driven decision making. Passionate about storytelling and building products that solve real-world problems.",
                            size: 22,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),

                new Paragraph({
                    text: "Core Competencies",
                    heading: HeadingLevel.HEADING_2,
                    border: { bottom: { color: "auto", space: 1, style: "single" as any, size: 6 } },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Go-to-Market (GTM) Strategy | Product Positioning | Competitive Analysis | User Research | SQL | Data Analytics (Tableau, Looker) | Stakeholder Management | Content Strategy",
                            size: 22,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),

                new Paragraph({
                    text: "Professional Experience",
                    heading: HeadingLevel.HEADING_2,
                    border: { bottom: { color: "auto", space: 1, style: "single" as any, size: 6 } },
                }),

                new Paragraph({
                    children: [
                        new TextRun({ text: "Senior Product Marketing Manager | Canva", bold: true, size: 24 }),
                        new TextRun({ text: "\t2021 – Present", bold: true }),
                    ],
                    spacing: { before: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Led the global GTM strategy for Canva Video, resulting in a 45% increase in user adoption within the first 6 months.", size: 22 }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Managed a cross-functional team of 15 designers, engineers, and researchers to execute multi-channel marketing campaigns.", size: 22 }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Conducted extensive user research and competitive analysis to refine product positioning and messaging.", size: 22 }),
                    ],
                }),

                new Paragraph({
                    children: [
                        new TextRun({ text: "Product Marketing Manager | HubSpot", bold: true, size: 24 }),
                        new TextRun({ text: "\t2017 – 2021", bold: true }),
                    ],
                    spacing: { before: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Developed and executed the GTM strategy for the HubSpot CRM free tier, driving 1M+ new user sign-ups.", size: 22 }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Optimized the self-service onboarding flow, reducing time-to-value by 30% for small business customers.", size: 22 }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "• Created sales enablement materials and training programs that improved lead conversion rates by 20%.", size: 22 }),
                    ],
                }),

                new Paragraph({
                    text: "Education",
                    heading: HeadingLevel.HEADING_2,
                    border: { bottom: { color: "auto", space: 1, style: "single" as any, size: 6 } },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "B.A. in Marketing | University of Texas at Austin", size: 22 }),
                    ],
                    spacing: { before: 200 },
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path.join(process.cwd(), "storage/resumes/Sarah_Jenkins_Master.docx"), buffer);
    console.log("Test resume generated successfully at storage/resumes/Sarah_Jenkins_Master.docx");
});
