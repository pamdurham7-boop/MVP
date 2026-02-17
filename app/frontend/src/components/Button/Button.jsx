import "./button.css";
import { useNavigate } from "react-router-dom";

export default function Button({ label, to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);       // navigate to route
    }
  };

  return (
    <button
      className="custom-btn"
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
