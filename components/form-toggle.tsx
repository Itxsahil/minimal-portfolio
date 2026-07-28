"use client"
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { MailForm } from './mail';
import { motion } from 'motion/react';

export const ContactButton = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [viewportInset, setViewportInset] = useState(0);
  const toggleModal = () => setModalOpen((isOpen) => !isOpen);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    if (!isModalOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isModalOpen]);

  useLayoutEffect(() => {
    const updateViewportInset = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const layoutHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
      setViewportInset(Math.max(0, layoutHeight - viewport.height - viewport.offsetTop));
    };

    updateViewportInset();
    window.visualViewport?.addEventListener('resize', updateViewportInset);
    window.visualViewport?.addEventListener('scroll', updateViewportInset);
    window.addEventListener('resize', updateViewportInset);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportInset);
      window.visualViewport?.removeEventListener('scroll', updateViewportInset);
      window.removeEventListener('resize', updateViewportInset);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `calc(1.25rem + ${viewportInset}px)`,
        right: '1.25rem',
        zIndex: 50,
      }}
    >
      <button
        type="button"
        aria-label="Open contact form"
        onClick={toggleModal}
        className="cursor-pointer rounded-full p-4 bg-rose-500 hover:bg-rose-600 transition shadow-lg shadow-rose-500/50"
      >
        <IconMessage className="w-6 h-6 text-white" />
      </button>

      {/* Contact Modal */}
      {isModalOpen && (
        <motion.div className="fixed inset-0 z-40"
          initial={{
            opacity: 0,
            y: 100,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 100,
          }}
        >
          <MailForm onClose={closeModal} />
        </motion.div>
      )}
    </div>
  )
}

const IconMessage = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"           // <— FORCE WHITE
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-message-circle"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
    </svg>
  );
};
