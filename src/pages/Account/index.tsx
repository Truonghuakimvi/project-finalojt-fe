import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Popconfirm,
  Table,
  Button,
  Modal,
  message,
  Select,
  Badge,
  Empty,
} from "antd";
import type { TablePaginationConfig, TableProps } from "antd";
import { IAccount } from "@/models/IAccount";
import {
  addAccount,
  deleteAccount,
  fetchAccounts,
  fetchEmployeesWithoutAccount,
  updateAccount,
} from "../../redux/Account/service";
import { RootState, useAppDispatch } from "../../store";
import { useSelector } from "react-redux";
import {
  selectAllAccounts,
  selectAllEmployees,
} from "../../redux/Account/slice";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { IEmployee } from "@/models/IEmployee";
import { IToken } from "@/models/IToken";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { AccountTranslations } from "@/models/IAccountTranslation";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: IAccount;
  index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  title,
  children,
  ...restProps
}) => {
  const { t } = useTranslation();
  const accountTranslations = t("account", {
    returnObjects: true,
  }) as AccountTranslations;
  const inputNode =
    dataIndex === "status" ? (
      <Select>
        <Select.Option value="Active">
          {accountTranslations.status1}
        </Select.Option>
        <Select.Option value="Inactive">
          {accountTranslations.status2}
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
              message: `${accountTranslations.confirm7} ${title}!`,
            },
            {
              type: dataIndex === "email" ? "email" : undefined,
              message: accountTranslations.validEmail,
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

const Account: React.FC = () => {
  const { t } = useTranslation();
  const accountTranslations = t("account", {
    returnObjects: true,
  }) as AccountTranslations;

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [popConfirmVisible, setPopConfirmVisible] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isEditing = (record: IAccount) => record._id === editingKey;

  const accounts = useSelector((state: RootState) => selectAllAccounts(state));

  const employees = useSelector((state: RootState) =>
    selectAllEmployees(state)
  );

  const isManager = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: IToken = jwtDecode(token);
      if (decoded.role === "Manager") return true;
      else return false;
    }
  };

  useEffect(() => {
    const role = isManager();
    if (!role) {
      window.location.href = "/project";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        dispatch(fetchAccounts()),
        dispatch(fetchEmployeesWithoutAccount()),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    setAccountData(accounts);
    setEmployeeData(employees);
  }, [accounts, employees]);

  const [accountData, setAccountData] = useState<IAccount[]>();
  const [employeeData, setEmployeeData] = useState<IEmployee[]>();

  const edit = (record: IAccount) => {
    editForm.setFieldsValue({ ...record });
    setEditingKey(record._id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: string) => {
    if (isManager()) {
      try {
        const row = await editForm.validateFields();
        const updatedData: Partial<IAccount> = { ...row };
        setIsLoading(true);
        await dispatch(
          updateAccount({ id: key, updateAccountDto: updatedData })
        );
        setIsLoading(false);
        setEditingKey("");
        message.success(accountTranslations.statusEdit);
      } catch (error) {
        if (error instanceof Error) message.error(accountTranslations.confirm8);
        setIsLoading(false);
      }
    } else message.error(accountTranslations.confirm9);
  };

  const addNewAccount = () => {
    setIsModalVisible(true);
  };

  const handleAddAccount = async () => {
    if (isManager()) {
      try {
        const values = await addForm.validateFields();
        setIsLoading(true);
        setIsModalVisible(false);
        await dispatch(addAccount(values));
        await dispatch(fetchEmployeesWithoutAccount());
        setIsLoading(false);
        addForm.resetFields();
        message.success(accountTranslations.statusAdd);
      } catch (error) {
        if (error instanceof Error) message.error(accountTranslations.confirm8);
        setIsLoading(false);
      }
    } else message.error(accountTranslations.confirm9);
  };

  const deleteRecord = async (id: string) => {
    if (isManager()) {
      try {
        setIsLoading(true);
        setPopConfirmVisible(null);
        await dispatch(deleteAccount(id));
        await dispatch(fetchEmployeesWithoutAccount());
        setIsLoading(false);
        message.success(accountTranslations.statusDelete);
      } catch (error) {
        if (error instanceof Error) message.error(accountTranslations.confirm8);
        setIsLoading(false);
      }
    } else message.error(accountTranslations.confirm9);
  };

  const columns = [
    {
      title: accountTranslations.noAccount,
      dataIndex: "index",
      width: "100px",
      render: (_: unknown, __: IEmployee, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: accountTranslations.nameAccount,
      dataIndex: "employeeId",
      render: (employeeId: { name: string } | undefined) =>
        employeeId ? employeeId.name : "N/A",
    },
    {
      title: accountTranslations.emailAccount,
      dataIndex: "email",
      editable: true,
    },
    {
      title: accountTranslations.statusAccount,
      dataIndex: "status",
      editable: true,
      render: (status: string) => (
        <Badge
          status={status === "Active" ? "success" : "error"}
          text={
            status === "Active"
              ? accountTranslations.status1
              : accountTranslations.status2
          }
        />
      ),
    },
    {
      title: accountTranslations.actionAccount,
      dataIndex: "action",
      render: (_: unknown, record: IAccount) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={() => save(record._id)} style={{ marginRight: 8 }}>
              {accountTranslations.savedAccount}
            </Button>
            <Button onClick={cancel}>
              {" "}
              {accountTranslations.cancelAccount}
            </Button>
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
              {accountTranslations.editAccount}
            </Button>
            <Popconfirm
              title={accountTranslations.confirm1}
              onConfirm={() => deleteRecord(record._id)}
              open={popConfirmVisible === record._id}
              onCancel={() => setPopConfirmVisible(null)}
            >
              <Button
                danger
                disabled={editingKey !== "" || record.status === "Active"}
                icon={<DeleteOutlined />}
                onClick={() => setPopConfirmVisible(record._id)}
              >
                {accountTranslations.deleteAccount}
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const mergedColumns: TableProps["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IAccount) => ({
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filteredData = accounts.filter((item: IAccount) =>
      item.email.toLowerCase().includes(value.toLowerCase())
    );
    setAccountData(filteredData);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <Input
          placeholder={accountTranslations.searchAccount}
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginRight: 8, width: 200 }}
        />
        <Button onClick={clearSearch}>
          {accountTranslations.clearAccount}
        </Button>
        <Button
          type="primary"
          onClick={addNewAccount}
          style={{ marginLeft: "auto" }}
          disabled={isLoading}
        >
          <PlusOutlined />
          {accountTranslations.addAccount}
        </Button>
      </div>
      <Form form={editForm} component={false} name="form_edit">
        <Table
          pagination={{
            locale: { items_per_page: `/ ${accountTranslations.page}` },
            current: currentPage,
            pageSize: pageSize,
            total: accountData && accountData.length,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          locale={
            (isLoading && {
              emptyText: (
                <Empty
                  description={accountTranslations.load}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }) || {
              emptyText: (
                <Empty
                  description={accountTranslations.empty}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }
          }
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={accountData}
          columns={mergedColumns}
          rowClassName="editable-row"
          rowKey="_id"
          scroll={
            accountData && accountData.length > 0 ? { y: 400 } : undefined
          }
          loading={isLoading}
        />
      </Form>
      <Modal
        title={accountTranslations.addAccount}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          addForm.resetFields();
        }}
        onOk={handleAddAccount}
        cancelText={accountTranslations.cancelAccount}
        okText={accountTranslations.savedAccount}
      >
        <Form form={addForm} layout="vertical" name="form_in_modal">
          <Form.Item
            name="employeeId"
            label={accountTranslations.employeeAccount}
            rules={[{ required: true, message: accountTranslations.confirm4 }]}
          >
            <Select
              showSearch
              placeholder={accountTranslations.holder}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={employeeData?.map((employee) => ({
                value: employee._id,
                label: `${employee.name}`,
              }))}
              listHeight={250}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={accountTranslations.emailAccount}
            rules={[
              { required: true, message: accountTranslations.confirm2 },
              { type: "email", message: accountTranslations.validEmail },
            ]}
          >
            <Input placeholder={accountTranslations.confirm5} />
          </Form.Item>
          <Form.Item
            name="password"
            label={accountTranslations.passwordAccount}
            rules={[{ required: true, message: accountTranslations.confirm3 }]}
          >
            <Input.Password
              autoComplete="true"
              placeholder={accountTranslations.confirm6}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Account;
