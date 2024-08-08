import { Button, Result } from "antd";

const notfound = () => {
  return (
    <Result
      style={{ marginTop: "50px" }}
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" href="/">
          Back Home
        </Button>
      }
    />
  );
};

export default notfound;
