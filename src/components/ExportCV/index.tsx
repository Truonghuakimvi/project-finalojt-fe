import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  BorderStyle,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { IEmployee } from "@/models/IEmployee";
import { IProject } from "@/models/IProject";
import { ISkill } from "@/models/ISkill";

const exportCV = async (employee: IEmployee) => {
  console.log("Employee Data:", employee);
  console.log("Projects Data:", employee.projects);
  console.log("Skills Data:", employee.skills);
  console.log("");

  const skillsWithNames = employee.skills.map((skill) => ({
    ...skill,
    name: skill.skillId.name,
  }));

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 32,
            bold: true,
            color: "#4b3a2e",
            font: "Century Gothic",
          },
          paragraph: {
            spacing: { after: 280 },
          },
        },
        {
          id: "NormalParagraph",
          name: "Normal Paragraph",
          basedOn: "Normal",
          quickFormat: true,
          run: {
            size: 22,
            color: "#4b3a2e",
            font: "Century Gothic",
          },
          paragraph: {
            spacing: { after: 100 },
          },
        },
        {
          id: "SpecialParagraph",
          name: "Special Paragraph",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 22,
            bold: true,
            color: "#4b3a2e",
            font: "Century Gothic",
          },
          paragraph: {
            spacing: { after: 100 },
          },
        },
        {
          id: "GrayParagraph",
          name: "Gray Paragraph",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 22,
            color: "#7F7F7F",
            font: "Century Gothic",
          },
        },
        {
          id: "ItalicslParagraph",
          name: "Italicsl Paragraph",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 22,
            italics: true,
            color: "#4b3a2e",
            font: "Century Gothic",
          },
          paragraph: {
            spacing: { after: 100 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: employee.name,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Position: ${employee.position.name}`,
            style: "NormalParagraph",
          }),
          new Paragraph({
            text: `Phone: ${employee.phoneNumber}`,
            style: "NormalParagraph",
          }),
          new Paragraph({
            text: `Email: ${employee.email}`,
            style: "NormalParagraph",
          }),
          new Paragraph({
            text: "Description:",
            style: "NormalParagraph",
            run: {
              bold: true,
              color: "#4b3a2e",
            },
          }),
          new Paragraph({
            text: employee.description,
            style: "NormalParagraph",
            spacing: { after: 900 },
          }),
          new Paragraph({
            text: "WORKING EXPERIENCE",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "05/2022 - now",
            style: "SpecialParagraph",
          }),
          new Paragraph({
            text: `${employee.position.name} at DevPlus – Da Nang`,
            style: "ItalicslParagraph",
          }),
          new Paragraph({
            text: "Develop applications and execute software development.",
            style: "NormalParagraph",
            spacing: { after: 800 },
          }),
          new Paragraph({
            text: "TYPICAL PROJECTS",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 800 },
          }),
          ...employee.projects
            .map((project: IProject) => {
              console.log("Project Data:", project);
              //const employeeRole = project.employees.find(
              //(empRole) => empRole.accountId._id === employee._id
              //);
              //const role = employeeRole ? employeeRole.role : "Not specified";
              return [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Project: ",
                      bold: true,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                    new TextRun({
                      text: `${project.name}`,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Description: ",
                      bold: true,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                    new TextRun({
                      text: `${project.description}`,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Technologies: ",
                      bold: true,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                    new TextRun({
                      text: `${project.technologies
                        .map((tech) => tech.name)
                        .join(", ")}`,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Start Date: ",
                      bold: true,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                    new TextRun({
                      text: `${dayjs(project.startDate).format("DD/MM/YYYY")}`,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "End Date: ",
                      bold: true,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                    new TextRun({
                      text: `${dayjs(project.endDate).format("DD/MM/YYYY")}`,
                      color: "#4b3a2e",
                      size: 22,
                      font: "Century Gothic",
                    }),
                  ],
                  spacing: { after: 900 },
                }),
              ];
            })
            .flat(),

          new Paragraph({
            text: "TECHNICAL SKILLS/QUALIFCATION",
            heading: HeadingLevel.HEADING_1,
            run: {
              bold: true,
              color: "#4b3a2e",
            },
          }),
          createSkillsTable(skillsWithNames),
          new Paragraph({
            text: "",
            spacing: { after: 250 },
          }),
          new Paragraph({
            style: "GrayParagraph",
            children: [
              new TextRun(
                "IMPORTANT CONFIDENTIALITY NOTICE: This document contains confidential and or"
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            style: "GrayParagraph",
            children: [
              new TextRun(
                "legally privileged information. ST United reserves all rights hereunder. When "
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            style: "GrayParagraph",
            children: [
              new TextRun(
                "distributed or transmitted, it is intended solely for the authorized use of the addressee"
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            style: "GrayParagraph",
            children: [
              new TextRun(
                "or intended recipient. Access to this information by anyone else is unauthorized."
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            style: "GrayParagraph",
            children: [
              new TextRun(
                "Disclosure, copying, distribution or any action or omission taken in reliance on it is"
              ),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            style: "GrayParagraph",
            children: [new TextRun("prohibited and may be unlawful.")],
            spacing: { after: 100 },
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${employee.name}_CV.docx`);
  });
};

const createSkillsTable = (
  skills: { skillId: ISkill; yearsOfExperience: number }[]
) => {
  return new Table({
    width: {
      size: 50,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "#4b3a2e" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "#4b3a2e" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "#4b3a2e" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "#4b3a2e" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                text: " Skill",
                style: "SpecialParagraph",
                alignment: "center",
              }),
            ],
          }),
          //new TableCell({
          //width: { size: 34, type: WidthType.PERCENTAGE },
          //children: [
          //new Paragraph({
          //text: " Experience (years)",
          //style: "NormalParagraph",
          //}),
          //],
          //}),
        ],
      }),
      ...skills.map(
        (skill) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 33, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    text: skill.skillId.name,
                    style: "NormalParagraph",
                    alignment: "center",
                  }),
                ],
              }),
              //new TableCell({
              //width: { size: 34, type: WidthType.PERCENTAGE },
              //children: [
              //new Paragraph({
              //text: skill.yearsOfExperience.toString(),
              //style: "NormalParagraph",
              //}),
              //],
              //}),
            ],
          })
      ),
    ],
  });
};

export default exportCV;
