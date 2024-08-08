import React, { useEffect, useState } from "react";
import {
  Table,
  Badge,
  Modal,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  message,
  Empty,
  Popconfirm,
  Descriptions,
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import dayjs from "dayjs";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { RootState, useAppDispatch } from "../../store";
import { useSelector } from "react-redux";
import {
  selectAllEmployees,
  selectAllPositions,
} from "../../redux/Employee/slice";
import {
  addEmployee,
  fetchEmployees,
  fetchPositions,
  updateEmployee,
} from "../../redux/Employee/service";
import { IPosition } from "@/models/IPosition";
import { IEmployee } from "@/models/IEmployee";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import parsePhoneNumberFromString from "libphonenumber-js";
import { jwtDecode } from "jwt-decode";
import { IToken } from "@/models/IToken";
import { useTranslation } from "react-i18next";
import { EmployeeTranslations } from "@/models/IEmployeeTranslation";
import { selectSkills } from "../../redux/Profile/slice";
import { fetchSkills } from "../../redux/Profile/service";
import exportCV from "../../components/ExportCV";
import saveAs from "file-saver";
import Papa from "papaparse";

const { Option } = Select;

const Employee: React.FC = () => {
  const dispatch = useAppDispatch();
  const positions = useSelector((state: RootState) =>
    selectAllPositions(state)
  );
  const employees = useSelector((state: RootState) =>
    selectAllEmployees(state)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [positionData, setPositionData] = useState<IPosition[]>([]);
  const [employeeData, setEmployeeData] = useState<IEmployee[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
    null
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [accountFilter, setAccountFilter] = useState<string>("");
  const skills = useSelector((state: RootState) => selectSkills(state));

  const { t } = useTranslation();
  const employeeTranslations = t("employee", {
    returnObjects: true,
  }) as EmployeeTranslations;

  const isManager = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: IToken = jwtDecode(token);
      if (decoded.role === "Manager") return true;
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleAccountFilterChange = (value: string) => {
    setAccountFilter(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        dispatch(fetchPositions()),
        dispatch(fetchEmployees()),
        dispatch(fetchSkills()),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    setPositionData(positions);
    setEmployeeData(employees);
  }, [positions, employees]);

  useEffect(() => {
    const role = isManager();
    if (!role) {
      window.location.href = "/project";
    }
  }, []);

  const columns: TableColumnsType<IEmployee> = [
    {
      title: employeeTranslations.noEmployee,
      dataIndex: "index",
      width: "100px",
      render: (_: unknown, __: IEmployee, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: employeeTranslations.nameEmployee,
      dataIndex: "name",
      render: (_: unknown, record: IEmployee) => (
        <Button type="link" onClick={() => handleNameClick(record)}>
          {record.name}
        </Button>
      ),
    },
    {
      title: employeeTranslations.phoneEmployee,
      dataIndex: "phoneNumber",
      render: (phoneNumber: string) => {
        const parsedNumber = parsePhoneNumberFromString(phoneNumber);
        return parsedNumber ? parsedNumber.formatInternational() : phoneNumber;
      },
    },
    {
      title: employeeTranslations.statusEmployee,
      dataIndex: "status",
      filters: [
        { text: employeeTranslations.status3, value: "Available" },
        { text: employeeTranslations.status1, value: "Involved" },
        { text: employeeTranslations.status2, value: "Inactive" },
      ],
      onFilter: (value, record) => record.status.includes(value as string),
      render: (status: string) => (
        <Badge
          status={
            (status === "Available" && "success") ||
            (status === "Involved" && "processing") ||
            "error"
          }
          text={
            (status === "Available" && employeeTranslations.status3) ||
            (status === "Involved" && employeeTranslations.status1) ||
            employeeTranslations.status2
          }
        />
      ),
    },
    {
      title: employeeTranslations.positionEmployee,
      dataIndex: "position",
      render: (position: IPosition) =>
        position.name == "No Position"
          ? employeeTranslations.noPosition
          : position.name,
      filters: positionData.map((pos) => ({
        text: pos.name,
        value: pos.name,
      })),
      onFilter: (value, record) => record.position.name === value,
    },
    {
      title: employeeTranslations.actionEmployee,
      dataIndex: "action",
      align: "center",
      width: "300px",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
            disabled={record.status === "Inactive"}
          >
            {employeeTranslations.editEmployee}
          </Button>
          <Popconfirm
            title={`${employeeTranslations.confirm11} ${record.name} ${employeeTranslations.confirm12}`}
            onConfirm={() => handleDelete(record)}
            okText={employeeTranslations.yes}
            cancelText={employeeTranslations.no}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              style={{ marginLeft: 8 }}
              disabled={record.status === "Inactive"}
            >
              {employeeTranslations.delete}
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleNameClick = (record: IEmployee) => {
    setSelectedEmployee(record);
    setIsDetailModalVisible(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = employeeData.filter((item) => {
    const matchesSearchTerm = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesAccountFilter =
      accountFilter === ""
        ? true
        : accountFilter === "true"
        ? item.hasAccount
        : !item.hasAccount;
    return matchesSearchTerm && matchesAccountFilter;
  });

  const clearSearch = () => {
    setSearchTerm("");
    setEmployeeData(employees);
  };

  const addNewEmployee = () => {
    setIsModalVisible(true);
  };

  const handleAddEmployee = async () => {
    if (isManager()) {
      try {
        const values = await addForm.validateFields();

        const phoneNumber = parsePhoneNumberFromString(
          `+${values.phoneNumber}`
        );
        const formattedPhoneNumber = phoneNumber
          ? phoneNumber.format("E.164")
          : values.phoneNumber;

        const addData: Partial<IEmployee> = {
          ...values,
          phoneNumber: formattedPhoneNumber,
          dateOfBirth: dayjs(values.dateOfBirth).format("YYYY-MM-DD"),
        };

        setIsLoading(true);
        setIsModalVisible(false);
        await dispatch(addEmployee(addData));
        await dispatch(fetchEmployees());
        setIsLoading(false);
        addForm.resetFields();
        message.success(employeeTranslations.statusAdd);
      } catch (error) {
        if (error instanceof Error)
          message.error(employeeTranslations.confirm13);
        setIsLoading(false);
      }
    } else message.error(employeeTranslations.confirm14);
  };

  const handleDelete = async (record: IEmployee) => {
    if (isManager()) {
      if (record.status !== "Available") {
        message.error(employeeTranslations.updateStatus);
        return;
      }
      try {
        const updateData = { status: "Inactive" };

        setIsLoading(true);
        await dispatch(
          updateEmployee({
            id: record._id,
            updateEmployeeDto: updateData,
          })
        );

        setIsLoading(false);
        message.success(employeeTranslations.only);
      } catch (error) {
        if (error instanceof Error) message.error(error.message);
        setIsLoading(false);
      }
    } else {
      message.error(employeeTranslations.confirm14);
    }
  };

  const handleEdit = (record: IEmployee) => {
    setSelectedEmployee(record);
    editForm.setFieldsValue({
      ...record,
      dateOfBirth: dayjs(record.dateOfBirth),
      position: record.position._id,
      phoneNumber: record.phoneNumber.replace(/^\+/, ""),
      skills: record.skills.map((skill) => skill.skillId._id),
    });
    setIsEditModalVisible(true);
  };

  const handleEditOk = async () => {
    if (isManager()) {
      try {
        const values = await editForm.validateFields();
        if (selectedEmployee) {
          if (
            selectedEmployee.status.includes("Involved") &&
            values.status === "Inactive"
          ) {
            message.error(employeeTranslations.confirm8);
            return;
          }

          const phoneNumber = parsePhoneNumberFromString(
            `+${values.phoneNumber}`
          );
          const formattedPhoneNumber = phoneNumber
            ? phoneNumber.format("E.164")
            : values.phoneNumber;

          const updatedData: Partial<IEmployee> = {
            ...values,
            phoneNumber: formattedPhoneNumber,
            dateOfBirth: dayjs(values.dateOfBirth).format("YYYY-MM-DD"),
            skills: values.skills.map((skillId: string) => ({
              skillId,
              yearsOfExperience: 0,
            })),
          };

          setIsLoading(true);
          setIsEditModalVisible(false);
          await dispatch(
            updateEmployee({
              id: selectedEmployee._id,
              updateEmployeeDto: updatedData,
            })
          );
          await dispatch(fetchPositions());
          setIsLoading(false);
          message.success(employeeTranslations.statusEdit);
          editForm.resetFields();
        }
      } catch (error) {
        if (error instanceof Error)
          message.error(employeeTranslations.confirm13);
        setIsLoading(false);
      }
    } else message.error(employeeTranslations.confirm14);
  };

  const validatePhoneNumber = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error(employeeTranslations.confirm2));
    }
    const phoneNumber = parsePhoneNumberFromString(
      value.startsWith("+") ? value : `+${value}`
    );
    if (phoneNumber && phoneNumber.isValid()) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(employeeTranslations.confirm6));
  };

  const exportList = () => {
    const csv = Papa.unparse(
      employeeData.map((item) => ({
        Id: item._id,
        Name: item.name,
        Status: item.status,
        Phone: item.phoneNumber,
        "Date Of Birth": dayjs(item.dateOfBirth).format("YYYY-MM-DD"),
        Gender: item.gender,
        Position: item.position.name,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "employees.csv");
  };

  return (
    <>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <Input
          placeholder={employeeTranslations.searchEmployee}
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ marginRight: 8, width: 200 }}
        />
        <Button onClick={clearSearch} style={{ marginRight: 20 }}>
          {employeeTranslations.clearEmployee}
        </Button>
        <Select
          placeholder={employeeTranslations.filter}
          value={accountFilter}
          onChange={handleAccountFilterChange}
          style={{ marginRight: 8, width: 200 }}
        >
          <Option value=""> {employeeTranslations.allAccount}</Option>
          <Option value="true">{employeeTranslations.hasAccount}</Option>
          <Option value="false">{employeeTranslations.noAccount}</Option>
        </Select>
        <Button
          type="primary"
          onClick={addNewEmployee}
          style={{ marginLeft: "auto" }}
          disabled={isLoading}
        >
          <PlusOutlined />
          {employeeTranslations.addEmployee}
        </Button>
        <Button
          onClick={exportList}
          style={{ color: "blue", marginLeft: "8px" }}
        >
          {employeeTranslations.export}
        </Button>
      </div>
      <Table
        pagination={{
          locale: { items_per_page: `/ ${employeeTranslations.page}` },
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        locale={
          isLoading
            ? {
                emptyText: (
                  <Empty
                    description={employeeTranslations.load}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }
            : {
                emptyText: (
                  <Empty
                    description={employeeTranslations.empty}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }
        }
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        scroll={
          employeeData && employeeData.length > 0 ? { y: 390 } : undefined
        }
        loading={isLoading}
      />
      <Modal
        title={employeeTranslations.addEmployee}
        open={isModalVisible}
        onOk={addNewEmployee}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <div key="footer" style={{ display: "flex" }}>
            <Button
              key="clear"
              onClick={() => addForm.resetFields()}
              style={{ marginRight: "auto" }}
            >
              {employeeTranslations.clearEmployee}
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={handleAddEmployee}
              style={{ marginRight: 8 }}
            >
              {employeeTranslations.saveEmployee}
            </Button>
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              {employeeTranslations.cancelEmployee}
            </Button>
          </div>,
        ]}
      >
        <Form form={addForm} layout="vertical" name="add_form">
          <Form.Item
            name="name"
            label={employeeTranslations.nameEmployee}
            rules={[{ required: true, message: employeeTranslations.confirm1 }]}
          >
            <Input placeholder={employeeTranslations.confirm1} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: employeeTranslations.confirm9 },
              { type: "email", message: employeeTranslations.confirm10 },
            ]}
          >
            <Input placeholder={employeeTranslations.confirm9} />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label={employeeTranslations.phoneEmployee}
            rules={[{ validator: validatePhoneNumber }]}
          >
            <PhoneInput
              inputStyle={{
                height: "35px",
                padding: "0px 58px",
                paddingRight: "14px",
                fontSize: "14px",
                width: "250px",
              }}
              country={"us"}
              value={""}
            />
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label={employeeTranslations.dobEmployee}
            rules={[{ required: true, message: employeeTranslations.confirm3 }]}
          >
            <DatePicker
              placeholder={employeeTranslations.selectdob}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs()}
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label={employeeTranslations.genderEmployee}
            rules={[{ required: true, message: employeeTranslations.confirm4 }]}
          >
            <Radio.Group>
              <Radio value="Male">{employeeTranslations.male}</Radio>
              <Radio value="Female">{employeeTranslations.female}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="position"
            label={employeeTranslations.positionEmployee}
            rules={[{ required: true, message: employeeTranslations.confirm5 }]}
          >
            <Select placeholder={employeeTranslations.selectposition}>
              {positionData &&
                positionData.map((pos) => (
                  <Option key={pos._id} value={pos._id}>
                    {pos.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {selectedEmployee && (
        <>
          <Modal
            title={employeeTranslations.detail}
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            footer={null}
          >
            <Descriptions column={1}>
              <Descriptions.Item label={employeeTranslations.nameEmployee}>
                {selectedEmployee.name}
              </Descriptions.Item>
              <Descriptions.Item label={employeeTranslations.phoneEmployee}>
                {selectedEmployee.phoneNumber &&
                  parsePhoneNumberFromString(
                    selectedEmployee.phoneNumber
                  )?.formatInternational()}
              </Descriptions.Item>
              <Descriptions.Item label={employeeTranslations.dobEmployee}>
                {dayjs(selectedEmployee.dateOfBirth).format("YYYY-MM-DD")}
              </Descriptions.Item>
              <Descriptions.Item label={employeeTranslations.genderEmployee}>
                {selectedEmployee.gender === "Male"
                  ? employeeTranslations.male
                  : employeeTranslations.female}
              </Descriptions.Item>
              <Descriptions.Item label={employeeTranslations.positionEmployee}>
                {selectedEmployee.position.name === "No Position"
                  ? employeeTranslations.noPosition
                  : selectedEmployee.position.name}
              </Descriptions.Item>
              <Descriptions.Item label={employeeTranslations.statusEmployee}>
                {(selectedEmployee.status === "Available" &&
                  employeeTranslations.status3) ||
                  (selectedEmployee.status === "Involved" &&
                    employeeTranslations.status1) ||
                  employeeTranslations.status2}
              </Descriptions.Item>
            </Descriptions>
            <Button
              onClick={() => exportCV(selectedEmployee)}
              style={{ color: "blue", marginTop: "15px" }}
            >
              {employeeTranslations.cv}
            </Button>
          </Modal>
          <Modal
            title={employeeTranslations.editEmployee}
            open={isEditModalVisible}
            onOk={handleEditOk}
            onCancel={() => setIsEditModalVisible(false)}
            footer={[
              <div key="footer" style={{ display: "flex" }}>
                <Button
                  key="clear"
                  onClick={() => editForm.resetFields()}
                  style={{ marginRight: "auto" }}
                >
                  {employeeTranslations.clearEmployee}
                </Button>
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleEditOk}
                  style={{ marginRight: 8 }}
                >
                  {employeeTranslations.saveEmployee}
                </Button>
                <Button
                  key="cancel"
                  onClick={() => setIsEditModalVisible(false)}
                >
                  {employeeTranslations.cancelEmployee}
                </Button>
              </div>,
            ]}
          >
            <Form form={editForm} layout="vertical" name="edit_form">
              <Form.Item
                name="name"
                label={employeeTranslations.nameEmployee}
                rules={[
                  { required: true, message: employeeTranslations.confirm1 },
                ]}
              >
                <Input placeholder={employeeTranslations.confirm1} />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label={employeeTranslations.phoneEmployee}
                rules={[{ validator: validatePhoneNumber }]}
              >
                <PhoneInput
                  inputStyle={{
                    height: "35px",
                    padding: "0px 58px",
                    paddingRight: "14px",
                    fontSize: "14px",
                    width: "250px",
                  }}
                  country={"us"}
                  value={editForm.getFieldValue("phoneNumber")}
                  onChange={(phone) =>
                    editForm.setFieldsValue({ phoneNumber: phone })
                  }
                />
              </Form.Item>
              <Form.Item
                name="dateOfBirth"
                label={employeeTranslations.dobEmployee}
                rules={[
                  { required: true, message: employeeTranslations.confirm3 },
                ]}
              >
                <DatePicker
                  placeholder={employeeTranslations.selectdob}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
              <Form.Item
                name="gender"
                label={employeeTranslations.genderEmployee}
                rules={[
                  { required: true, message: employeeTranslations.confirm4 },
                ]}
              >
                <Radio.Group>
                  <Radio value="Male">{employeeTranslations.male}</Radio>
                  <Radio value="Female">{employeeTranslations.female}</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="position"
                label={employeeTranslations.positionEmployee}
                rules={[
                  { required: true, message: employeeTranslations.confirm5 },
                ]}
              >
                <Select placeholder={employeeTranslations.selectposition}>
                  {positionData &&
                    positionData.map((pos) => (
                      <Option key={pos._id} value={pos._id}>
                        {pos.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item name="skills" label={employeeTranslations.skill}>
                <Select
                  mode="multiple"
                  placeholder={employeeTranslations.selectSkill}
                >
                  {skills?.map((skill) => (
                    <Option key={skill._id} value={skill._id}>
                      {skill.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </>
  );
};

export default Employee;
