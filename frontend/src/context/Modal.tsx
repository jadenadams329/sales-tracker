import { useRef, useState, useContext, createContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalContextType {
  modalRef: React.RefObject<HTMLDivElement | null>;
  modalContent: ReactNode | null;
  setModalContent: (content: ReactNode | null) => void;
  setOnModalClose: (callback: (() => void) | null) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  // callback function that will be called when modal is closing
  const [onModalClose, setOnModalClose] = useState<(() => void) | null>(null);

  const closeModal = () => {
    setModalContent(null); // clear the modal contents
    // If callback function is truthy, call the callback function and reset it
    // to null:
    if (typeof onModalClose === "function") {
      setOnModalClose(null);
      onModalClose();
    }
  };

  const contextValue: ModalContextType = {
    modalRef, // reference to modal div
    modalContent, // React component to render inside modal
    setModalContent, // function to set the React component to render inside modal
    setOnModalClose, // function to set the callback function called when modal is closing
    closeModal // function to close the modal
  };

  return (
    <>
      <ModalContext.Provider value={contextValue}>
        {children}
      </ModalContext.Provider>
      <div ref={modalRef} />
    </>
  );
}

export function Modal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal must be used within a ModalProvider');
  }

  const { modalRef, modalContent, closeModal } = context;

  // If there is no div referenced by the modalRef or modalContent is not a
  // truthy value, render nothing:
  if (!modalRef || !modalRef.current || !modalContent) return null;

  // Render the following component to the div referenced by the modalRef
  return createPortal(
    <div id="modal">
      <div id="modal-background" onClick={closeModal} />
      <div id="modal-content">{modalContent}</div>
    </div>,
    modalRef.current
  );
}

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
