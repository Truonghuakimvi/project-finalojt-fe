import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  message,
  Badge,
  Select,
  DatePicker,
  Popconfirm,
  TablePaginationConfig,
} from "antd";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../store";
import {
  addProject,
  updateProject,
  deleteProject,
  restoreProject,
  fetchProjectsByAccount,
  fetchProjectsByEmployee,
} from "../../redux/Project/service";
import {
  selectAllProjects,
  selectProjectMessages,
} from "../../redux/Project/slice";
import { selectAllSkill } from "../../redux/Skill/slice";
import { IProject } from "@/models/IProject";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RollbackOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { fetchSkill } from "../../redux/Skill/service";
import { jwtDecode } from "jwt-decode";
import { selectAllAccounts } from "../../redux/Account/slice";
import { fetchAccounts } from "../../redux/Account/service";
import { Link } from "react-router-dom";
import { PATH } from "../../configs/path";
import { useTranslation } from "react-i18next";
import { ProjectTranslation } from "@/models/IProjectTranslation";
import emailjs from "@emailjs/browser";
import { IToken } from "@/models/IToken";

const { RangePicker } = DatePicker;

const ProjectPage: React.FC = () => {
  const { t } = useTranslation();
  const projectTranslations = t("project", {
    returnObjects: true,
  }) as ProjectTranslation;
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeletedProjectsModalVisible, setIsDeletedProjectsModalVisible] =
    useState(false);
  const [currentProject, setCurrentProject] = useState<IProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<IProject[]>([]);
  const [deletedProjects, setDeletedProjects] = useState<IProject[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const projects = useSelector(selectAllProjects);
  const skills = useSelector(selectAllSkill);
  const accounts = useSelector(selectAllAccounts);
  const messages = useSelector(selectProjectMessages);

  const activeSkills = skills.filter((skill) => skill.status === "Active");

  const filteredAccounts = useMemo(
    () => accounts.filter((account) => account.status !== "Inactive"),
    [accounts]
  );

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

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

  const sendEmailNotification = async (
    email: string,
    projectName: string,
    action: string
  ) => {
    try {
      let message = "";
      if (action === "add") {
        message = `You have been added to the project team. Your skills and expertise will be valuable assets to this project. We look forward to your contributions and collaboration with the team.`;
      } else if (action === "remove") {
        message = `You have been removed from the project team. We appreciate the work and effort you've put into this project. If you have any questions about this change, please don't hesitate to reach out to your manager or the project lead.`;
      }

      await emailjs.send(
        "service_1i0j1pg",
        "template_mnle85l",
        {
          to_email: email,
          project_name: projectName,
          message: message,
        },
        "GzvurAWIw9NcrgBh1"
      );
    } catch (error) {
      message.error(`Failed to send email notification to ${email}`);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((msg) => {
        sendEmailNotification(msg.email, msg.projectName, msg.message);
      });
    }
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      dispatch(fetchSkill());
      await dispatch(fetchAccounts());

      if (userInfo) {
        if (userInfo.role === "Manager") {
          await dispatch(fetchProjectsByAccount(userInfo.sub));
        } else {
          await dispatch(fetchProjectsByEmployee(userInfo.id));
        }
      }

      setIsLoading(false);
    };
    fetchData();
  }, [dispatch, userInfo]);

  useEffect(() => {
    setFilteredProjects(
      projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !project.isDeleted
      )
    );
    setDeletedProjects(projects.filter((project) => project.isDeleted));
  }, [searchTerm, projects]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredProjects(projects.filter((project) => !project.isDeleted));
  };

  const handleAddProject = async () => {
    try {
      const values = await form.validateFields();
      const newProject: Partial<IProject> = {
        ...values,
        startDate: values.dateRange[0]?.toISOString(),
        endDate: values.dateRange[1]?.toISOString(),
        technologies: values.technology,
        projectManager: userInfo?.sub,
      };
      setIsLoading(true);
      await dispatch(addProject(newProject));
      message.success(projectTranslations.statusAdd);
      setIsAddModalVisible(false);
      form.resetFields();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedProject: Partial<IProject> = {
        ...values,
        startDate: values.dateRange[0]?.toISOString(),
        endDate: values.dateRange[1]?.toISOString(),
      };

      updatedProject.employees = values.employees.map((employeeId: string) => ({
        accountId: employeeId,
        role: null,
      }));

      setIsLoading(true);
      if (currentProject) {
        await dispatch(
          updateProject({
            id: currentProject._id,
            updateProjectDto: updatedProject,
          })
        );
        message.success(projectTranslations.statusEdit);
      }
      setIsEditModalVisible(false);
      editForm.resetFields();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: IProject) => {
    setCurrentProject(project);
    const formValues = {
      name: project.name,
      description: project.description,
      status: project.status,
      technologies: project.technologies.map((tech) => tech._id),
      employees: project.employees.map((e) => e.accountId._id),
      dateRange:
        project.startDate && project.endDate
          ? [dayjs(project.startDate), dayjs(project.endDate)]
          : [],
    };
    editForm.setFieldsValue(formValues);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (project: IProject) => {
    if (project.status === "Ongoing") {
      message.error(projectTranslations.statusFail);
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(deleteProject(project._id));
      message.success(projectTranslations.statusDelete);
    } catch (error) {
      message.error(projectTranslations.statusFail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (project: IProject) => {
    setIsLoading(true);
    try {
      await dispatch(restoreProject(project._id));
      message.success(projectTranslations.resProject);
      setIsDeletedProjectsModalVisible(false);
    } catch (error) {
      message.error(projectTranslations.statusFail);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvRows = [];
    const headers = [
      "Project Name",
      "Description",
      "Status",
      "Start Date",
      "End Date",
    ];
    csvRows.push(headers.join(","));

    filteredProjects.forEach((project) => {
      const row = [
        project.name,
        project.description,
        project.status,
        dayjs(project.startDate).format("YYYY-MM-DD"),
        dayjs(project.endDate).format("YYYY-MM-DD"),
      ];
      csvRows.push(row.join(","));
    });

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "projects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: projectTranslations.no,
      dataIndex: "index",
      width: "100px",
      render: (_: unknown, __: IProject, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: projectTranslations.name,
      dataIndex: "name",
      key: "name",
      render: (text: string, record: IProject) => (
        <Link style={{ color: "#1677ff" }} to={`${PATH.PROJECT}/${record._id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: projectTranslations.description,
      dataIndex: "description",
      key: "description",
    },
    {
      title: projectTranslations.status,
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={
            (status === "Not Started" && "default") ||
            (status === "Ongoing" && "processing") ||
            "success"
          }
          text={
            (status === "Not Started" && projectTranslations.notStart) ||
            (status === "Ongoing" && projectTranslations.onGoing) ||
            projectTranslations.complete
          }
        />
      ),
    },

    ...(userInfo && userInfo.role === "Manager"
      ? [
          {
            title: projectTranslations.action,
            key: "action",
            render: (_: undefined, record: IProject) => (
              <>
                <Button
                  type="primary"
                  onClick={() => handleEdit(record)}
                  icon={<EditOutlined />}
                  style={{ marginRight: 8 }}
                >
                  {projectTranslations.edit}
                </Button>
                <Popconfirm
                  title={projectTranslations.delete}
                  description={projectTranslations.confirm4}
                  onConfirm={() => handleDelete(record)}
                  okText={projectTranslations.delete}
                  cancelText={projectTranslations.cancle}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    {projectTranslations.delete}
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]
      : []),
  ];

  const deletedColumns = [
    {
      title: projectTranslations.name,
      dataIndex: "name",
      key: "name",
    },
    {
      title: projectTranslations.description,
      dataIndex: "description",
      key: "description",
    },
    {
      title: projectTranslations.status,
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={
            (status === "Not Started" && "default") ||
            (status === "Ongoing" && "processing") ||
            "success"
          }
          text={
            (status === "Not Started" && projectTranslations.notStart) ||
            (status === "Ongoing" && projectTranslations.onGoing) ||
            projectTranslations.complete
          }
        />
      ),
    },
    {
      title: projectTranslations.action,
      key: "action",
      render: (_: undefined, record: IProject) => (
        <Button
          type="primary"
          icon={<RollbackOutlined />}
          onClick={() => handleRestore(record)}
        >
          {projectTranslations.restore}
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <Input
          placeholder={projectTranslations.search}
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginRight: 8, width: 200 }}
        />
        <Button onClick={clearSearch}>{projectTranslations.clear}</Button>
        {userInfo?.role == "Manager" && (
          <Button
            onClick={() => setIsDeletedProjectsModalVisible(true)}
            style={{ marginRight: 8, marginLeft: "auto" }}
          >
            <RollbackOutlined />
            {projectTranslations.viewDelete}
          </Button>
        )}
        {userInfo?.role == "Manager" && (
          <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
            <PlusOutlined />
            {projectTranslations.addProject}
          </Button>
        )}
        <Button
          type="default"
          onClick={exportToCSV}
          icon={<DownloadOutlined />}
          style={{ marginLeft: 8 }}
        >
          {projectTranslations.export}
        </Button>
      </div>
      <Table
        pagination={{
          locale: { items_per_page: `/ ${projectTranslations.page}` },
          current: currentPage,
          pageSize: pageSize,
          total: filteredProjects.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        columns={columns}
        dataSource={filteredProjects}
        rowKey="_id"
        loading={isLoading}
        locale={{
          emptyText: isLoading ? "Loading..." : projectTranslations.noProject,
        }}
      />
      <Modal
        title={projectTranslations.addProject}
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        onOk={handleAddProject}
        confirmLoading={isLoading}
        okText={projectTranslations.save}
        cancelText={projectTranslations.cancle}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: "",
            description: "",
            status: "",
            technology: [],
            dateRange: [null, null],
          }}
        >
          <Form.Item
            name="name"
            label={projectTranslations.name}
            rules={[{ required: true, message: projectTranslations.confirm1 }]}
          >
            <Input placeholder={projectTranslations.nameP} />
          </Form.Item>
          <Form.Item name="description" label={projectTranslations.description}>
            <Input.TextArea placeholder={projectTranslations.descriptionP} />
          </Form.Item>
          <Form.Item
            name="technology"
            label={projectTranslations.technology}
            rules={[{ required: true, message: projectTranslations.confirm2 }]}
          >
            <Select
              mode="multiple"
              placeholder={projectTranslations.selectTech}
              optionFilterProp="label"
              filterOption={(input, option) => {
                if (typeof option?.label === "string") {
                  return option.label
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {activeSkills.map((skill) => (
                <Select.Option
                  key={skill._id}
                  value={skill._id}
                  label={skill.name}
                >
                  {skill.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label={projectTranslations.date}
            rules={[{ required: true, message: projectTranslations.confirm3 }]}
          >
            <RangePicker
              format="YYYY-MM-DD"
              placeholder={[
                projectTranslations.dateStart,
                projectTranslations.dateEnd,
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={projectTranslations.edit}
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
        }}
        okText={projectTranslations.save}
        cancelText={projectTranslations.cancle}
        onOk={handleEditProject}
        confirmLoading={isLoading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label={projectTranslations.name}
            rules={[{ required: true, message: projectTranslations.confirm1 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label={projectTranslations.description}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="technologies"
            label={projectTranslations.technology}
            rules={[{ required: true, message: projectTranslations.confirm2 }]}
          >
            <Select
              mode="multiple"
              placeholder={projectTranslations.selectTech}
              optionFilterProp="label"
              filterOption={(input, option) => {
                if (typeof option?.label === "string") {
                  return option.label
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {activeSkills.map((skill) => (
                <Select.Option
                  key={skill._id}
                  value={skill._id}
                  label={skill.name}
                >
                  {skill.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label={projectTranslations.date}
            rules={[{ required: true, message: projectTranslations.confirm3 }]}
          >
            <RangePicker
              format="YYYY-MM-DD"
              placeholder={[
                projectTranslations.dateStart,
                projectTranslations.dateEnd,
              ]}
            />
          </Form.Item>
          <Form.Item name="employees" label={projectTranslations.employee}>
            <Select
              mode="multiple"
              placeholder={projectTranslations.confirm5}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                if (typeof option?.label === "string") {
                  return option.label
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {filteredAccounts.map((account) => (
                <Select.Option
                  key={account._id}
                  value={account._id}
                  label={account.employeeId.name}
                >
                  {account.employeeId.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={projectTranslations.history}
        open={isDeletedProjectsModalVisible}
        onCancel={() => setIsDeletedProjectsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={deletedColumns}
          dataSource={deletedProjects}
          rowKey="_id"
          loading={isLoading}
          locale={{
            emptyText: isLoading ? "Loading..." : projectTranslations.noDelete,
          }}
        />
      </Modal>
    </>
  );
};

export default ProjectPage;
