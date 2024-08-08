import React, { useEffect, useState } from "react";
import {
  Layout,
  Table,
  Input,
  Button,
  Form,
  Select,
  message,
  Tabs,
  Modal,
  Badge,
  TablePaginationConfig,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { ISkill } from "../../models/ISkill";
import { ISkillTranslation } from "../../models/ISkillTranslation";
import { RootState, useAppDispatch } from "../../store";
import { useSelector } from "react-redux";
import { selectAllSkill } from "../../redux/Skill/slice";
import {
  fetchSkill,
  addSkill,
  updateSkill,
  deleteSkill,
} from "../../redux/Skill/service";
import { useTranslation } from "react-i18next";
import { IToken } from "@/models/IToken";
import { jwtDecode } from "jwt-decode";

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: ISkill;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  children,
  ...restProps
}) => {
  const { t } = useTranslation();
  const skillTranslations = t("skill", {
    returnObjects: true,
  }) as ISkillTranslation;
  const inputNode =
    dataIndex === "status" ? (
      <Select>
        <Select.Option value="Active">{skillTranslations.active}</Select.Option>
        <Select.Option value="Inactive">
          {skillTranslations.inactive}
        </Select.Option>
      </Select>
    ) : (
      <Input />
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `${skillTranslations.confirm1}`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const Skill: React.FC = () => {
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("Technology");
  const [technologySearchTerm, setTechnologySearchTerm] = useState("");
  const [programmingLanguageSearchTerm, setProgrammingLanguageSearchTerm] =
    useState("");
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dispatch = useAppDispatch();

  const skills = useSelector((state: RootState) => selectAllSkill(state));
  const status = useSelector((state: RootState) => state.skill.status);
  const error = useSelector((state: RootState) => state.skill.error);
  const { t } = useTranslation();
  const skillTranslations = t("skill", {
    returnObjects: true,
  }) as ISkillTranslation;

  const [technologyPagination, setTechnologyPagination] = useState<{
    currentPage: number;
    pageSize: number;
  }>({ currentPage: 1, pageSize: 10 });

  const [programmingLanguagePagination, setProgrammingLanguagePagination] =
    useState<{
      currentPage: number;
      pageSize: number;
    }>({ currentPage: 1, pageSize: 10 });

  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (activeTab === "Technology") {
      setTechnologyPagination({
        currentPage: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
      });
    } else {
      setProgrammingLanguagePagination({
        currentPage: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
      });
    }
  };

  const isManager = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: IToken = jwtDecode(token);
      if (decoded.role === "Manager") return true;
    }
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSkill());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const role = isManager();
    if (!role) {
      window.location.href = "/project";
    }
  }, []);

  useEffect(() => {
    if (status === "failed" && error) {
      message.error(error);
    }
  }, [status, error]);

  const filteredTechnologies = skills.filter(
    (skill) =>
      skill.category === "Technology" &&
      skill.name.toLowerCase().includes(technologySearchTerm.toLowerCase())
  );

  const filteredProgrammingLanguages = skills.filter(
    (skill) =>
      skill.category === "Programming Language" &&
      skill.name
        .toLowerCase()
        .includes(programmingLanguageSearchTerm.toLowerCase())
  );

  const isEditing = (record: ISkill) => record._id === editingKey;

  const edit = (record: ISkill) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: string) => {
    try {
      const row = await form.validateFields();
      await dispatch(updateSkill({ id: key, updateSkillDto: row })).unwrap();
      setEditingKey("");
      message.success(skillTranslations.statusEdit);
    } catch (errInfo) {
      message.error(skillTranslations.statusFail);
    }
  };

  const handleCreate = async (values: Partial<ISkill>) => {
    try {
      await dispatch(addSkill(values)).unwrap();
      message.success(skillTranslations.statusAdd);
      addForm.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error(skillTranslations.statusFail);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSkill(id)).unwrap();
      message.success(skillTranslations.statusDelete);
    } catch (error) {
      message.error(skillTranslations.statusFail);
    }
  };

  const columns = [
    {
      title: skillTranslations.no,
      dataIndex: "index",
      width: "100px",
      render: (_: unknown, __: ISkill, index: number) => {
        if (activeTab === "Technology") {
          return (
            (technologyPagination.currentPage - 1) *
              technologyPagination.pageSize +
            index +
            1
          );
        } else {
          return (
            (programmingLanguagePagination.currentPage - 1) *
              programmingLanguagePagination.pageSize +
            index +
            1
          );
        }
      },
    },
    {
      title: skillTranslations.name,
      dataIndex: "name",
      key: "name",
      editable: true,
    },
    {
      title: skillTranslations.status,
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={status === "Active" ? "success" : "error"}
          // text={status.charAt(0).toUpperCase() + status.slice(1)}
          text={
            (status === "Active" && skillTranslations.active) ||
            skillTranslations.inactive
          }
        />
      ),
      editable: true,
    },
    {
      title: skillTranslations.action,
      dataIndex: "actions",
      render: (_: unknown, record: ISkill) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record._id)}
              style={{ marginRight: 8 }}
              type="link"
            >
              {skillTranslations.save}
            </Button>
            <Button onClick={cancel} type="link">
              {skillTranslations.cancle}
            </Button>
          </span>
        ) : (
          <>
            <Button
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
              type="primary"
              icon={<EditOutlined />}
              style={{ marginRight: 8 }}
            >
              {skillTranslations.edit}
            </Button>
            <Button
              disabled={editingKey !== "" || record.status === "Active"}
              onClick={() => handleDelete(record._id)}
              icon={<DeleteOutlined />}
              danger
            >
              {skillTranslations.delete}
            </Button>
          </>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ISkill) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const renderViewEntities = (
    entities: ISkill[],
    _category: string,
    setSearchTerm: (value: string) => void,
    paginationState: { currentPage: number; pageSize: number }
  ) => (
    <div>
      <Search
        placeholder={`${skillTranslations.search}`}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 20 }}
        enterButton={<SearchOutlined />}
      />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          onChange={handleTableChange}
          dataSource={entities}
          columns={mergedColumns}
          loading={status === "loading"}
          rowKey="_id"
          pagination={{
            locale: { items_per_page: `/ ${skillTranslations.page}` },
            current: paginationState.currentPage,
            pageSize: paginationState.pageSize,
            total: entities.length,
            showSizeChanger: true,
          }}
        />
      </Form>
    </div>
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    addForm.resetFields();
  };

  const handleAddSkill = () => {
    addForm.validateFields().then((values) => {
      handleCreate(values);
    });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (editingKey !== "") {
      cancel();
    }
  };

  return (
    <Layout>
      <Content>
        <div>
          <Button
            type="primary"
            onClick={showModal}
            style={{ marginBottom: 16 }}
          >
            {skillTranslations.addSkill}
          </Button>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              label: skillTranslations.tech,
              key: "Technology",
              children: renderViewEntities(
                filteredTechnologies,
                "Technology",
                setTechnologySearchTerm,
                technologyPagination
              ),
            },
            {
              label: skillTranslations.languageProgram,
              key: "Programming Language",
              children: renderViewEntities(
                filteredProgrammingLanguages,
                "Programming Language",
                setProgrammingLanguageSearchTerm,
                programmingLanguagePagination
              ),
            },
          ]}
        />
        <Modal
          title={skillTranslations.addSkill}
          open={isModalVisible}
          onCancel={handleCancel}
          onOk={handleAddSkill}
          cancelText={skillTranslations.cancle}
          okText={skillTranslations.save}
        >
          <Form form={addForm} layout="vertical" name="form_in_modal">
            <Form.Item
              name="name"
              label={skillTranslations.name}
              rules={[{ required: true, message: skillTranslations.confirm1 }]}
            >
              <Input placeholder={skillTranslations.confirm1} />
            </Form.Item>
            <Form.Item
              name="category"
              label={skillTranslations.category}
              rules={[{ required: true, message: skillTranslations.confirm2 }]}
            >
              <Select placeholder={skillTranslations.confirm2}>
                <Option value="Technology">{skillTranslations.tech}</Option>
                <Option value="Programming Language">
                  {skillTranslations.languageProgram}
                </Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Skill;
