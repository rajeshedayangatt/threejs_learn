import ReactDOM from "react-dom";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalFooter from "react-bootstrap/ModalFooter";
import ModalTitle from "react-bootstrap/ModalTitle";

 const ModalPop = () => {
  return (
    <Modal show={true} size="sm">
      <ModalHeader>
        <ModalTitle>Hi</ModalTitle>
      </ModalHeader>
      <ModalBody>asdfasdf</ModalBody>
      <ModalFooter>This is the footer</ModalFooter>
    </Modal>
  );
};

export default ModalPop;