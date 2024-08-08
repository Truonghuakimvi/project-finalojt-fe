import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Badge,
  Empty,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { TablePaginationConfig, TableProps } from "antd";
import { IPosition } from "../../models/IPosition";
import { RootState, useAppDispatch } from "../../store";
import { useSelector } from "react-redux";
import { selectAllPosition } from "../../redux/Position/slice";
import {
  fetchPosition,
  addPosition,
  updatePosition,
  deletePosition,
} from "../../redux/Position/service";
import { useTranslation } from "react-i18next";
import { PositionTranslation } from "@/models/IPositionTranslation";
import { jwtDecode } from "jwt-decode";
import { IToken } from "@/models/IToken";


interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: IPosition;
  index: number;
  children: React.ReactNode;
}
const Position: React.FC = () => {
  const { t } = useTranslation();
  const positionTranslations = t("position", {
    returnObjects: true,
  }) as PositionTranslation;
  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    children,
    ...restProps
  }) => {
    const inputNode =
      dataIndex === "status" ? (
        <Select>
          <Select.Option value="Active">
            {positionTranslations.status1}
          </Select.Option>
          <Select.Option value="Inactive">
            {positionTranslations.status2}
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
                message: `${positionTranslations.please} ${title}!`,
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

  const [editingKey, setEditingKey] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [popConfirmVisible, setPopConfirmVisible] = useState<string | null>(
    null
  );
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const positions = useSelector((state: RootState) => selectAllPosition(state));
  const [positionData, setPositionData] = useState<IPosition[]>([]);
  const isManager = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: IToken = jwtDecode(token);
      if (decoded.role === "Manager") return true;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch(fetchPosition());
      setIsLoading(false);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const role = isManager();
    if (!role) {
      window.location.href = "/project";
    }
  }, []);

  useEffect(() => {
    setPositionData(positions);
  }, [positions]);

  const isEditing = (record: IPosition) => record._id === editingKey;

  const edit = (record: IPosition) => {
    editForm.setFieldsValue({ ...record });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async () => {
    try {
      const row = await editForm.validateFields();
      setIsLoading(true);
      await dispatch(
        updatePosition({ id: editingKey, updatePositionDto: row })
      ).unwrap();
      setEditingKey("");
      setIsLoading(false);
      message.success(positionTranslations.statusEdit);
    } catch (errInfo) {
      message.error(positionTranslations.statusFail);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await dispatch(deletePosition(id)).unwrap();
      message.success(positionTranslations.statusDelete);
      setIsLoading(false);
      setPopConfirmVisible(null);
    } catch (error) {
      message.error(positionTranslations.statusFail);
      setIsLoading(false);
    }
  };

  const addNewPosition = () => {
    setIsModalVisible(true);
  };

  const handleAddPosition = async () => {
    try {
      const values = await addForm.validateFields();
      setIsLoading(true);
      await dispatch(addPosition(values)).unwrap();
      message.success(positionTranslations.statusAdd);
      setIsModalVisible(false);
      setIsLoading(false);
      addForm.resetFields();
    } catch (error) {
      message.error(positionTranslations.statusFail);
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = positionData.filter((item) => {
    const matchesSearchTerm = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearchTerm;
  });

  const clearSearch = () => {
    setSearchTerm("");
    setPositionData(positions);
  };

  const columns = [
    {
      title: positionTranslations.no,
      dataIndex: "index",
      width: "100px",
      render: (_: unknown, __: IPosition, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: positionTranslations.name,
      dataIndex: "name",
      width: "200px",
      editable: true,
    },
    {
      title: positionTranslations.description,
      dataIndex: "description",
      editable: true,
    },
    {
      title: positionTranslations.status,
      dataIndex: "status",
      width: "150px",
      editable: true,
      render: (status: string) => (
        <Badge
          status={status === "Active" ? "success" : "error"}
          text={
            status === "Active"
              ? positionTranslations.status1
              : positionTranslations.status2
          }
        />
      ),
    },
    {
      title: positionTranslations.action,
      dataIndex: "action",
      width: "300px",
      align: "center" as const,
      render: (_: unknown, record: IPosition) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={save} style={{ marginRight: 8 }}>
              {positionTranslations.save}
            </Button>
            <Button onClick={cancel}>{positionTranslations.cancle}</Button>
          </span>
        ) : (
          <span>
            <Button
              disabled={editingKey !== ""}
              type="primary"
              onClick={() => edit(record)}
              icon={<EditOutlined />}
              style={{ marginRight: 8 }}
            >
              {positionTranslations.edit}
            </Button>
            <Popconfirm
              title={positionTranslations.confirm3}
              onConfirm={() => handleDelete(record._id)}
              open={popConfirmVisible === record._id}
              onCancel={() => setPopConfirmVisible(null)}
              okText={positionTranslations.delete}
              cancelText={positionTranslations.cancle}
            >
              <Button
                danger
                disabled={editingKey !== "" || record.status === "Active"}
                icon={<DeleteOutlined />}
                onClick={() => setPopConfirmVisible(record._id)}
              >
                {positionTranslations.delete}
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const mergedColumns: TableProps<IPosition>["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IPosition) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  return (
    <>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <Input
          placeholder={positionTranslations.search}
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginRight: 8, width: 200 }}
        />
        <Button onClick={clearSearch}>{positionTranslations.clear}</Button>
        <Button
          type="primary"
          onClick={addNewPosition}
          style={{ marginLeft: "auto" }}
          disabled={isLoading}
        >
          <PlusOutlined />
          {positionTranslations.addProject}
        </Button>
      </div>
      <Form form={editForm} component={false}>
        <Table<IPosition>
          rowKey="_id"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={filteredData}
          columns={mergedColumns}
          pagination={{
            locale: { items_per_page: `/ ${positionTranslations.page}` },
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          loading={isLoading}
          locale={{
            emptyText: isLoading ? (
              <Empty
                description="Loading..."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Empty
                description="No data"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Form>
      <Modal
        title={positionTranslations.addProject}
        open={isModalVisible}
        onOk={handleAddPosition}
        okText={positionTranslations.save}
        cancelText={positionTranslations.cancle}
        onCancel={() => {
          setIsModalVisible(false);
          addForm.resetFields();
        }}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label={positionTranslations.name}
            rules={[{ required: true, message: positionTranslations.confirm1 }]}
          >
            <Input placeholder={positionTranslations.confirm1} />
          </Form.Item>
          <Form.Item
            name="description"
            label={positionTranslations.description}
          >
            <Input placeholder={positionTranslations.confirm2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Position;
