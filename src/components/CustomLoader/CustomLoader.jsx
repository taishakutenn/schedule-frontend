import { Oval } from "react-loader-spinner";

export default function OvalLoader({ className }) {
  return (
    <Oval
      visible={true}
      height="50"
      width="50"
      color="var(--main-accent-color)"
      ariaLabel="oval-loading"
      wrapperStyle={{}}
      wrapperClass={className}
    />
  );
}
