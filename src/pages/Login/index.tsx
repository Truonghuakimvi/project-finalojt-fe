import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Modal, Spin, Input, Button, Form, message } from "antd";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch } from "../../store";
import { login } from "../../redux/Login/service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/Login/slice";
import emailjs from "@emailjs/browser";
import { EncryptStorage } from "encrypt-storage";
import "./Login.css";
import axiosInstance from "../../libs/interceptor";

const schema = yup.object({
  email: yup.string().required("Email is required."),
  password: yup.string().required("Password is required"),
});

interface ILoginInputs {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginInputs>({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRemember, setIsRemember] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetForm] = Form.useForm();

  const secretKey = "VY6DDdWwXHfIZVhyOeA5MwUc6kTSahLN";
  const storage = new EncryptStorage(secretKey);

  const dispatch = useAppDispatch();
  const { status } = useSelector(selectAuth);

  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsRemember(event.target.checked);
  };

  useEffect(() => {
    if (localStorage.getItem("email") && localStorage.getItem("password"))
      setIsRemember(true);
  }, []);

  const onSubmit: SubmitHandler<ILoginInputs> = async (data) => {
    setErrorMessage(null);
    const resultAction = await dispatch(login(data));

    if (login.fulfilled.match(resultAction)) {
      window.location.href = "/";
      if (isRemember) {
        localStorage.setItem("email", data.email);
        storage.setItem("password", data.password);
      } else {
        localStorage.removeItem("email");
        storage.removeItem("password");
      }
    } else if (login.rejected.match(resultAction)) {
      if (resultAction.payload) {
        setErrorMessage(resultAction.payload as string);
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  const handleForgotPassword = () => {
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    const values = await resetForm.validateFields();
    try {
      const response = await axiosInstance.post("/accounts/reset-password", {
        email: values.email,
      });

      const { newPassword } = response.data;

      if (!newPassword) {
        throw new Error("New password not received from the server");
      }

      await emailjs.send(
        "service_1i0j1pg",
        "template_2ty6x3e",
        { email: values.email, newPassword: newPassword },
        "GzvurAWIw9NcrgBh1"
      );

      setModalVisible(false);
      message.success("Password reset email sent successfully!");
    } catch (error) {
      message.error("Failed to reset password.");
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    resetForm.resetFields();
  };

  return (
    <div className="parent">
      <form className="container" onSubmit={handleSubmit(onSubmit)}>
        <div className="header">
          <div className="text">Login</div>
        </div>
        <div className="inputs">
          {errorMessage && (
            <div className="field">
              <div className="error-input">{errorMessage}</div>
            </div>
          )}
          <div className="field">
            <div className="input">
              <UserOutlined
                style={{
                  fontSize: "22px",
                  position: "absolute",
                  transform: "translateX(60%)",
                  color: "black",
                }}
              />
              <input
                type="text"
                placeholder="Email"
                defaultValue={localStorage.getItem("email") || ""}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <span className="error">{errors.email.message}</span>
            )}
          </div>
          <div className="field">
            <div className="input">
              <LockOutlined
                style={{
                  fontSize: "22px",
                  position: "absolute",
                  transform: "translateX(60%)",
                  color: "black",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="true"
                placeholder="Password"
                defaultValue={storage.getItem("password") || ""}
                {...register("password")}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </span>
            </div>
            {errors.password && (
              <span className="error">{errors.password.message}</span>
            )}
          </div>
        </div>
        <div className="remember">
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              id="rememberMe"
              type="checkbox"
              onChange={handleCheckbox}
              checked={isRemember}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <label onClick={handleForgotPassword} style={{ cursor: "pointer" }}>
            Forgot password?
          </label>
        </div>
        <div className="submit-container">
          <button
            className="submit"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? <Spin /> : "Login"}
          </button>
        </div>
      </form>
      <Modal
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={handleModalOk}
            style={{
              width: "100%",
              backgroundColor: "#404040",
              fontWeight: "500",
              marginTop: "10px",
            }}
            size="large"
          >
            Send instructions
          </Button>,
        ]}
      >
        <h1
          style={{ fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}
        >
          Reset your password
        </h1>
        <div style={{ fontSize: "16px", marginBottom: "20px" }}>
          Enter your email and we'll send you instructions on how to reset your
          password.
        </div>
        <Form form={resetForm} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your Email" },
              { type: "email", message: "The input is not valid E-mail!" },
            ]}
          >
            <Input size="large" placeholder="Email Address" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
