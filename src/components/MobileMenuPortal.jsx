import { createPortal } from "react-dom";

export default function MobileMenuPortal({ children }) {
  return createPortal(children, document.body);
}
