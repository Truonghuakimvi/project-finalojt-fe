import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, useAppDispatch } from "../../store";
import {
  fetchProjectById,
  updateEmployeeRole,
} from "../../redux/Project/service";
import {
  selectSelectedProject,
  selectProjectDetailStatus,
  clearSelectedProject,
} from "../../redux/Project/slice";
import {
  Card,
  Table,
  Tag,
  Typography,
  Divider,
  Modal,
  Select,
  Form,
  message,
  Spin,
} from "antd";
import { IEmployeeRole, IProject } from "@/models/IProject";
import { IToken } from "@/models/IToken";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { ProjectTranslation } from "@/models/IProjectTranslation";

const { Title, Paragraph } = Typography;

const ProjectDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const projectTranslations = t("project", {
    returnObjects: true,
  }) as ProjectTranslation;
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const project = useSelector((state: RootState) =>
    selectSelectedProject(state)
  );
  const detailStatus = useSelector((state: RootState) =>
    selectProjectDetailStatus(state)
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<IEmployeeRole | null>(null);
  const [form] = Form.useForm();

  const getUserInfo = useMemo(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: IToken = jwtDecode(token);
      return {
        sub: decoded.sub,
        id: decoded.id || "",
        role: decoded.role,
      };
    }
    return null;
  }, []);

  const userInfo = getUserInfo;

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
    return () => {
      dispatch(clearSelectedProject());
    };
  }, [dispatch, id]);

  const handleRoleClick = (employee: IEmployeeRole) => {
    setSelectedEmployee(employee);
    form.setFieldsValue({ role: employee.role || projectTranslations.noRole });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (id && selectedEmployee?.accountId._id) {
          dispatch(
            updateEmployeeRole({
              projectId: id,
              accountId: selectedEmployee.accountId._id,
              role: values.role,
            })
          )
            .unwrap()
            .then(() => {
              message.success(projectTranslations.updateRole);
              setIsModalVisible(false);
            })
            .catch((error) => {
              message.error(`${projectTranslations.failRole} ${error}`);
            });
        } else {
          message.error(projectTranslations.missRole);
        }
      })
      .catch((info) => {
        console.log(projectTranslations.validRole, info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: projectTranslations.employeeName,
      dataIndex: "name",
      key: "name",
      render: (_: string, record: IEmployeeRole) => (
        <span>{record.accountId?.employeeId?.name || "Unknown"}</span>
      ),
    },
    {
      title: projectTranslations.role,
      dataIndex: "role",
      key: "role",
      render: (role: string, record: IEmployeeRole) => (
        <span
          style={{
            cursor:
              userInfo && userInfo.role === "Manager" ? "pointer" : "default",
            color: "#1677ff",
          }}
          onClick={
            userInfo && userInfo.role === "Manager"
              ? () => handleRoleClick(record)
              : undefined
          }
        >
          {role || projectTranslations.noRole}
        </span>
      ),
    },
  ];

  if (detailStatus === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (detailStatus === "failed") {
    return (
      <Card>
        <Title level={4}>{projectTranslations.errorLoad}</Title>
      </Card>
    );
  }

  const renderProjectDetails = (project: IProject) => (
    <>
      <Card
        title={projectTranslations.projectDetail}
        bordered={false}
        style={{ marginBottom: "24px" }}
      >
        <Title level={2}>{project.name}</Title>
        <Paragraph>{project.description}</Paragraph>
        <Paragraph>
          <strong>{projectTranslations.status}:</strong> {project.status}
        </Paragraph>
        <Paragraph>
          <strong>{projectTranslations.dateStart}:</strong>{" "}
          {project.startDate &&
            new Date(project.startDate).toLocaleDateString()}
        </Paragraph>
        <Paragraph>
          <strong>{projectTranslations.dateEnd}:</strong>{" "}
          {project.endDate && new Date(project.endDate).toLocaleDateString()}
        </Paragraph>
        <Paragraph>
          <strong>{projectTranslations.manager}:</strong>{" "}
          {project.projectManager?.email || projectTranslations.notAssign}
        </Paragraph>
        <div style={{ marginTop: "24px" }}>
          <Title level={4}>{projectTranslations.technology}</Title>
          <div>
            {project.technologies.map((tech) => (
              <Tag key={tech._id} color="blue">
                {tech.name}
              </Tag>
            ))}
          </div>
        </div>
      </Card>

      <Divider />

      <Card title={projectTranslations.employee} bordered={false}>
        <Table
          dataSource={project.employees}
          columns={columns}
          rowKey={(record) => record.accountId._id}
        />
      </Card>

      <Modal
        title={projectTranslations.editRole}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={projectTranslations.save}
        cancelText={projectTranslations.cancle}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role"
            label={projectTranslations.role}
            rules={[{ required: true, message: projectTranslations.confirm6 }]}
          >
            <Select placeholder={projectTranslations.selectRole}>
              <Select.Option value="Developer">Developer</Select.Option>
              <Select.Option value="Manager">Manager</Select.Option>
              <Select.Option value="Designer">Designer</Select.Option>
              <Select.Option value="Tester">Tester</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "auto" }}>
      {project ? (
        renderProjectDetails(project)
      ) : (
        <Card>
          <Title level={4}>{projectTranslations.noProject}</Title>
        </Card>
      )}
    </div>
  );
};

export default ProjectDetailPage;
