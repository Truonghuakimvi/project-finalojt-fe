import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { logout } from "../../redux/Login/slice";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ProjectOutlined,
  RadarChartOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Avatar, Dropdown } from "antd";
import LanguageSelector from "../Lang";
import Logo from "../../assets/components/logo";
import "./sidebar.css";
import { RootState, useAppDispatch } from "../../store";
import { selectAccount } from "../../redux/Profile/slice";
import { jwtDecode } from "jwt-decode";
import { fetchAccount } from "../../redux/Profile/service";

const { Header, Sider, Content } = Layout;

interface SidebarTranslations {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
  line7: string;
}

const SideBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const account = useSelector((state: RootState) => selectAccount(state));

  const sideBarTranslations = t("sideBar", {
    returnObjects: true,
  }) as SidebarTranslations;

  const [collapsed, setCollapsed] = useState(false);
  const [title, setTitle] = useState("Crew Control");

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  const getEmployeeId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.sub;
    }
  };

  useEffect(() => {
    const id = getEmployeeId();
    if (id) {
      dispatch(fetchAccount(id));
    }
  }, [dispatch]);

  useEffect(() => {
    switch (location.pathname) {
      case "/account":
        setTitle(sideBarTranslations.line1);
        break;
      case "/employee":
        setTitle(sideBarTranslations.line2);
        break;
      case "/skill":
        setTitle(sideBarTranslations.line3);
        break;
      case "/position":
        setTitle(sideBarTranslations.line4);
        break;
      case "/project":
        setTitle(sideBarTranslations.line5);
        break;
      default:
        setTitle("Crew Control");
        break;
    }
  }, [location.pathname, sideBarTranslations]);

  useEffect(() => {
    const handleLanguageChange = () => {
      navigate(location.pathname);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n, navigate, location.pathname]);

  const userMenuItems =
    account?.role !== "Manager"
      ? [
          {
            key: "1",
            label: (
              <NavLink to="/profile">
                <div className="dropdown-item-user-info">
                  <strong>{account?.employeeId.name}</strong>
                  <span style={{ color: "gray" }}>{account?.email}</span>
                </div>
              </NavLink>
            ),
          },
          {
            type: "divider" as const,
          },
          {
            key: "2",
            label: sideBarTranslations.line7,
            onClick: handleLogout,
          },
        ]
      : [
          {
            key: "1",
            label: sideBarTranslations.line7,
            onClick: handleLogout,
          },
        ];

  const menuItems =
    account?.role == "Manager"
      ? [
          {
            key: "/account",
            icon: <UnorderedListOutlined />,
            label: (
              <NavLink
                to="/account"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {sideBarTranslations.line1}
              </NavLink>
            ),
          },
          {
            key: "/employee",
            icon: <UserOutlined />,
            label: (
              <NavLink
                to="/employee"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {sideBarTranslations.line2}
              </NavLink>
            ),
          },
          {
            key: "/skill",
            icon: <RadarChartOutlined />,
            label: (
              <NavLink
                to="/skill"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {sideBarTranslations.line3}
              </NavLink>
            ),
          },
          {
            key: "/project",
            icon: <ProjectOutlined />,
            label: (
              <NavLink
                to="/project"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {sideBarTranslations.line5}
              </NavLink>
            ),
          },
          {
            key: "/position",
            icon: <TeamOutlined />,
            label: (
              <NavLink
                to="/position"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {sideBarTranslations.line4}
              </NavLink>
            ),
          },
        ]
      : [
          {
            key: "/project",
            icon: <ProjectOutlined />,
            label: (
              <NavLink
                to="/project"
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {sideBarTranslations.line5}
              </NavLink>
            ),
          },
        ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <NavLink to="/">
          <div className="demo-logo-vertical">
            <Logo color="#ffffff" />
          </div>
        </NavLink>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="custom-menu"
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <h2 style={{ marginLeft: "16px" }}>{title}</h2>
          </div>
          <div className="header-actions">
            <LanguageSelector />

            {account?.role !== "Manager" ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Avatar
                  size="large"
                  src={account?.employeeId.avatar}
                  style={{
                    cursor: "pointer",
                    marginLeft: "16px",
                    fontSize: "20px",
                  }}
                >
                  {account?.employeeId.name.charAt(0)}
                </Avatar>
              </Dropdown>
            ) : (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Avatar
                  size="large"
                  style={{
                    cursor: "pointer",
                    marginLeft: "16px",
                    fontSize: "20px",
                  }}
                >
                  {"M"}
                </Avatar>
              </Dropdown>
            )}
          </div>
        </Header>
        <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SideBar;
