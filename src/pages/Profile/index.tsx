import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Descriptions,
  Tag,
  Row,
  Col,
  Space,
  Upload,
  Modal,
  Button,
  message,
  List,
  Empty,
  Form,
  Input,
  Select,
} from "antd";
import {
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  MailOutlined,
  InboxOutlined,
  ManOutlined,
  EditOutlined,
  WomanOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import {
  RcFile,
  UploadFile,
  UploadChangeParam,
} from "antd/es/upload/interface";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../firebase";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import styles from "./Test.module.css";
import { RootState, useAppDispatch } from "../../store";
import { fetchAccount, fetchSkills } from "../../redux/Profile/service";
import { jwtDecode } from "jwt-decode";
import { selectAccount, selectSkills } from "../../redux/Profile/slice";
import { useSelector } from "react-redux";
import parsePhoneNumberFromString from "libphonenumber-js";
import dayjs from "dayjs";
import { updateEmployee } from "../../redux/Employee/service";
import { IAccount } from "@/models/IAccount";
import { IEmployee } from "@/models/IEmployee";
import { useTranslation } from "react-i18next";
import { EmployeeTranslations } from "@/models/IEmployeeTranslation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import TextArea from "antd/es/input/TextArea";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const EmployeeProfile: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const dispatch = useAppDispatch();
  const [employeeData, setEmployeeData] = useState<IAccount | null>(null);
  const account = useSelector((state: RootState) => selectAccount(state));
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
    null
  );
  const skills = useSelector((state: RootState) => selectSkills(state));

  const activeSkills = skills.filter((skill) => skill.status === "Active");

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

  const { t } = useTranslation();
  const employeeTranslations = t("employee", {
    returnObjects: true,
  }) as EmployeeTranslations;

  const getEmployeeId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.sub;
    }
  };

  useEffect(() => {
    dispatch(fetchSkills());
  }, [dispatch]);

  useEffect(() => {
    const id = getEmployeeId();
    if (id) {
      dispatch(fetchAccount(id));
    }
  }, [dispatch]);

  useEffect(() => {
    setEmployeeData(account);
  }, [account]);

  const handleFileChange = ({ fileList }: UploadChangeParam<UploadFile>) => {
    setFileList(fileList.slice(-1));
    if (fileList.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string | ArrayBuffer);
        }
      };
      reader.readAsDataURL(fileList[0].originFileObj as RcFile);
    }
  };

  const handleUpload = async () => {
    if (!fileList.length) {
      message.error(employeeTranslations.noFile);
      return;
    }

    try {
      const croppedCanvas = cropper?.getCroppedCanvas();
      if (!croppedCanvas) throw new Error(employeeTranslations.failCanvas);

      croppedCanvas.toBlob(async (blob) => {
        if (!blob) throw new Error(employeeTranslations.failConvert);

        setIsModalVisible(false);
        const fileExtension = "jpeg";
        const fileName = `${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, `images/${fileName}`);

        const uploadResult = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        if (employeeData && employeeData.employeeId.avatar) {
          const oldAvatarRef = ref(storage, employeeData.employeeId.avatar);
          await deleteObject(oldAvatarRef);
        }

        if (employeeData) {
          await dispatch(
            updateEmployee({
              id: employeeData.employeeId._id,
              updateEmployeeDto: { avatar: downloadURL },
            })
          );
          await dispatch(fetchAccount(employeeData._id));
        }

        message.success(employeeTranslations.image);

        setFileList([]);
        setImage(null);
        setCropper(null);
      }, "image/jpeg");
    } catch (error) {
      message.error(employeeTranslations.uploadFail);
    }
  };

  const handleEdit = (record: IEmployee) => {
    setSelectedEmployee(record);
    form.setFieldsValue({
      ...record,
      dateOfBirth: dayjs(record.dateOfBirth),
      phoneNumber: record.phoneNumber.replace(/^\+/, ""),
      skills: record.skills.map((skill) => skill.skillId._id),
    });
    setIsEditModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      if (selectedEmployee) {
        const phoneNumber = parsePhoneNumberFromString(
          `+${values.phoneNumber}`
        );
        const formattedPhoneNumber = phoneNumber
          ? phoneNumber.format("E.164")
          : values.phoneNumber;

        const updatedData: Partial<IEmployee> = {
          ...values,
          phoneNumber: formattedPhoneNumber,
          skills: values.skills.map((skillId: string) => ({
            skillId,
            yearsOfExperience: 0,
          })),
        };

        setIsEditModalVisible(false);
        await dispatch(
          updateEmployee({
            id: selectedEmployee._id,
            updateEmployeeDto: updatedData,
          })
        );

        if (employeeData) await dispatch(fetchAccount(employeeData._id));
        message.success(employeeTranslations.statusEdit);
        form.resetFields();
      }
    } catch (error) {
      if (error instanceof Error) message.error(employeeTranslations.confirm13);
    }
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <Card>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={6} style={{ textAlign: "center" }}>
              <Space direction="vertical">
                <Avatar
                  size={150}
                  src={employeeData?.employeeId.avatar}
                  onClick={() => {
                    setIsModalVisible(true);
                  }}
                  style={{ cursor: "pointer", fontSize: "80px" }}
                >
                  {employeeData?.employeeId.name.charAt(0)}
                </Avatar>
                <Text type="secondary">
                  {employeeData?.employeeId.position.name}
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={18}>
              <Space
                direction="vertical"
                size="middle"
                style={{ rowGap: "5px" }}
              >
                <Title level={3}>{employeeData?.employeeId.name}</Title>
                <Paragraph style={{ fontSize: "16px" }}>
                  {employeeData?.employeeId.description}
                </Paragraph>
                <Space wrap style={{ columnGap: "20px" }}>
                  <Text>
                    <MailOutlined /> {account?.email}
                  </Text>
                  <Text>
                    <PhoneOutlined />
                    {employeeData?.employeeId.phoneNumber &&
                      parsePhoneNumberFromString(
                        employeeData.employeeId.phoneNumber
                      )?.formatInternational()}
                  </Text>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>
        <Button
          type="primary"
          onClick={() => {
            employeeData && handleEdit(employeeData.employeeId);
          }}
          className={styles.editButton}
          icon={<EditOutlined />}
        >
          {employeeTranslations.editProfile}
        </Button>
      </div>
      <Row gutter={[24, 24]} style={{ marginTop: "20px" }}>
        <Col xs={24} md={12}>
          <Card title={employeeTranslations.infor} size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={employeeTranslations.dobEmployee}>
                <CalendarOutlined
                  style={{ marginRight: "8px", alignSelf: "center" }}
                />
                {dayjs(employeeData?.employeeId.dateOfBirth).format(
                  "YYYY-MM-DD"
                )}
              </Descriptions.Item>
              <Descriptions.Item label={employeeTranslations.idCard}>
                <IdcardOutlined
                  style={{ marginRight: "8px", alignSelf: "center" }}
                />
                {employeeData?.employeeId.citizenIdentityCard}
              </Descriptions.Item>
              <Descriptions.Item label={employeeTranslations.genderEmployee}>
                {employeeData?.employeeId.gender === "Male" ? (
                  <>
                    <ManOutlined
                      style={{ marginRight: "8px", alignSelf: "center" }}
                    />
                    {employeeTranslations.male}
                  </>
                ) : (
                  <>
                    <WomanOutlined
                      style={{ marginRight: "8px", alignSelf: "center" }}
                    />
                    {employeeTranslations.female}
                  </>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={employeeTranslations.skill}
            size="small"
            style={{ height: "100%" }}
          >
            {employeeData?.employeeId.skills.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
            ) : (
              <Row gutter={[24, 6]} style={{ flexWrap: "wrap" }}>
                {employeeData?.employeeId.skills.map((skill) => (
                  <Col key={skill.skillId._id} style={{ marginBottom: "8px" }}>
                    <Tag color="blue" style={{ margin: "4px" }}>
                      {skill.skillId.name}
                    </Tag>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: "20px" }}>
        <Col xs={24}>
          <Card title={employeeTranslations.project} size="small">
            <List
              dataSource={employeeData?.employeeId.projects}
              renderItem={(project) => (
                <List.Item>
                  <Space>
                    <TagOutlined />
                    {project.name}
                    <Tag
                      color={
                        (project.status === "Available" && "green") ||
                        (project.status === "Involved" && "blue") ||
                        "red"
                      }
                    >
                      {project.status}
                    </Tag>
                  </Space>
                </List.Item>
              )}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={false}
                  />
                ),
              }}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title={employeeTranslations.picture}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setFileList([]);
          setImage(null);
          setCropper(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalVisible(false);
              setFileList([]);
              setImage(null);
              setCropper(null);
            }}
          >
            {employeeTranslations.cancelEmployee}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUpload}
            disabled={!fileList.length}
          >
            {employeeTranslations.saveEmployee}
          </Button>,
        ]}
      >
        <Dragger
          name="file"
          listType="picture"
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={(file) => {
            setFileList([file as UploadFile]);
            return false;
          }}
          showUploadList={false}
          style={{
            border: "1px dashed #d9d9d9",
            padding: "16px",
            display: "block",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <InboxOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <p className="ant-upload-text">{employeeTranslations.pic1}</p>
            <p className="ant-upload-hint">{employeeTranslations.pic2}</p>
          </div>
        </Dragger>
        {image && (
          <div
            style={{
              marginTop: "20px",
              overflow: "hidden",
              borderRadius: "4px",
            }}
          >
            <Cropper
              src={image as string}
              style={{ height: 300, width: "100%" }}
              aspectRatio={1}
              guides={false}
              viewMode={1}
              minCropBoxWidth={100}
              minCropBoxHeight={100}
              background={false}
              autoCropArea={1}
              onInitialized={(instance) => setCropper(instance)}
            />
          </div>
        )}
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
              onClick={() => form.resetFields()}
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
            <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
              {employeeTranslations.cancelEmployee}
            </Button>
          </div>,
        ]}
      >
        {isEditModalVisible && (
          <Form form={form} layout="vertical" name="edit_form">
            <Form.Item
              name="name"
              label={employeeTranslations.nameEmployee}
              rules={[
                { required: true, message: employeeTranslations.confirm1 },
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
                value={form.getFieldValue("phoneNumber")}
                onChange={(phone) =>
                  form.setFieldsValue({ phoneNumber: phone })
                }
              />
            </Form.Item>
            <Form.Item
              name="description"
              label={employeeTranslations.description}
            >
              <TextArea rows={4} style={{ resize: "none" }} />
            </Form.Item>
            <Form.Item name="skills" label={employeeTranslations.skill}>
              <Select
                mode="multiple"
                placeholder={employeeTranslations.selectSkill}
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
                {activeSkills?.map((skill) => (
                  <Option key={skill._id} value={skill._id} label={skill.name}>
                    {skill.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default EmployeeProfile;
